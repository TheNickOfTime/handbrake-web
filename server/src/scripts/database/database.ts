import SQLite from 'better-sqlite3';
import { access, mkdir } from 'fs/promises';
import { Kysely, SqliteDialect } from 'kysely';
import logger from 'logging';
import path from 'path';
import { dataPath } from '../data';
import { initStatusTableSchema } from './database-status';
import type { Database } from './database-types';
import DatabaseMigrations from './migrations/database-migrations';

const databasePath = path.join(dataPath, 'handbrake.db');

export const databaseVersion = 1;

const sqlite = new SQLite('../data/handbrake-test.db');

export const database = new Kysely<Database>({
	dialect: new SqliteDialect({
		database: sqlite,
	}),
});

sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export async function DatabaseConnect() {
	try {
		// Check if database tables exist ----------------------------------------------------------
		const checkTablesStatement = sqlite.prepare(
			`SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`
		);
		const checkTablesResult = checkTablesStatement.all();
		const databaseExists = checkTablesResult.length > 0;

		// Create the tables if they don't exist ---------------------------------------------------
		const tableCreateStatements = [
			...initStatusTableSchema,
			// ...queueTableCreateStatements,
			// ...watcherTableCreateStatements,
		];

		tableCreateStatements.forEach(async (statement) => await statement.execute());

		// Check database version ------------------------------------------------------------------
		await CheckDatabaseVersion(databaseExists);

		logger.info('[server] [database] The database connection has been initalized!');
	} catch (err) {
		logger.error(err);
	}
}

export async function DatabaseDisconnect() {
	try {
		sqlite.pragma('wal_checkpoint(full)');
		database.destroy();
		logger.info(`[server] [database] The database has been disconnected.`);
	} catch (error) {
		logger.error(`[server] [database] [error] Could not disconnect the database.`);
		logger.error(error);
	}
}

async function CheckDatabaseVersion(databaseExists: boolean) {
	const createVersionTableStatement = database.schema
		.createTable('database_version')
		.ifNotExists()
		.addColumn('version', 'integer', (col) => col.notNull().primaryKey());

	if (databaseExists) {
		try {
			const checkVersionStatement = database.selectFrom('database_version').select('version');
			const checkVersionResult = await checkVersionStatement.executeTakeFirstOrThrow();
			if (!checkVersionResult) {
				throw new Error(
					'[server] [database] [error] Cannot get database_version from the database. Application will now shut down.'
				);
			}

			const currentVersion = checkVersionResult.version;

			if (currentVersion < databaseVersion) {
				await DatabaseBackup(`database-version-${currentVersion}-backup`);
				DatabaseMigrations(currentVersion);
			} else if (currentVersion > databaseVersion) {
				logger.error(
					`[server] [database] [error] The database's version (${currentVersion}) is greater than the application's target version (${databaseVersion}). The database cannot be downgraded and therefore cannot be loaded.`
				);
				logger.error(
					`[server] [database] [error] Please attempt recovery by copying a previous version of the database (${databaseVersion} or lower) from '${dataPath}/backups' to '${databasePath}'.`
				);
				process.exit();
			}
		} catch {
			await DatabaseBackup(`database-version-0-backup`);
			DatabaseMigrations(-1);
		}
	} else {
		await createVersionTableStatement.execute();

		const insertVersionStatement = database
			.insertInto('database_version')
			.values({ version: databaseVersion });
		await insertVersionStatement.execute();
	}
}

async function DatabaseBackup(name: string) {
	const backupDir = path.join(dataPath, 'backup');
	const backupName = name + '.db';
	const backupPath = path.join(backupDir, backupName);

	try {
		try {
			await access(backupDir);
		} catch {
			await mkdir(backupDir);
		}

		await sqlite.backup(backupPath);

		logger.info(`[server] [database] [backup] Backed up the database to '${backupPath}'.`);
	} catch (error) {
		logger.error(
			`[server] [database] [backup] [error] Could not backup the database to '${backupPath}'.`
		);
		logger.error(error);
	}
}

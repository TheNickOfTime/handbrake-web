import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { access, mkdir } from 'fs/promises';
import logger from 'logging';
import path from 'path';

import { watcherTableCreateStatements } from 'scripts/database/database-watcher';
import { dataPath } from '../data';
import { queueTableCreateStatements } from './database-queue';
import DatabaseMigrations from './migrations/database-migrations';

const databasePath = path.join(dataPath, 'handbrake.db');

export const databaseVersion = 1;

export let database: DatabaseType = new Database(databasePath, {});
database.pragma('journal_mode = WAL');
database.pragma('foreign_keys = ON');

export async function DatabaseConnect() {
	try {
		// Check if database tables exist ----------------------------------------------------------
		const checkTablesStatement = database.prepare(
			`SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`
		);
		const checkTablesResult = checkTablesStatement.all();
		const databaseExists = checkTablesResult.length > 0;

		// Create the tables if they don't exist ---------------------------------------------------
		const tableCreateStatements = [
			...queueTableCreateStatements,
			'CREATE TABLE IF NOT EXISTS status(id TEXT NOT NULL, state INTEGER NOT NULL, PRIMARY KEY (id))',
			...watcherTableCreateStatements,
		]
			.map((statement) => statement.replace(/\t/gm, ''))
			.map((statement) => database.prepare(statement));

		tableCreateStatements.forEach((statement) => statement.run());

		// Check database version ------------------------------------------------------------------
		await CheckDatabaseVersion(databaseExists);

		logger.info('[server] [database] The database connection has been initalized!');
	} catch (err) {
		logger.error(err);
	}
}

export async function DatabaseDisconnect() {
	try {
		database.pragma('wal_checkpoint(full)');
		database.close();
		logger.info(`[server] [database] The database has been disconnected.`);
	} catch (error) {
		logger.error(`[server] [database] [error] Could not disconnect the database.`);
		logger.error(error);
	}
}

async function CheckDatabaseVersion(databaseExists: boolean) {
	const createVersionTableStatement = database.prepare(
		'CREATE TABLE IF NOT EXISTS database_version(version INT NOT NULL PRIMARY KEY)'
	);
	if (databaseExists) {
		try {
			const checkVersionStatement = database.prepare<[], { version: number }>(
				'SELECT version FROM database_version'
			);
			const checkVersionResult = checkVersionStatement.get();
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
		createVersionTableStatement.run();

		const insertVersionStatement = database.prepare<{ version: number }>(
			'INSERT INTO database_version(version) VALUES($version)'
		);
		insertVersionStatement.run({ version: databaseVersion });
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

		await database.backup(backupPath);

		logger.info(`[server] [database] [backup] Backed up the database to '${backupPath}'.`);
	} catch (error) {
		logger.error(
			`[server] [database] [backup] [error] Could not backup the database to '${backupPath}'.`
		);
		logger.error(error);
	}
}

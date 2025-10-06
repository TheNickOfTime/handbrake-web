import type { Database } from '@handbrake-web/shared/types/database';
import SQLite from 'better-sqlite3';
import { Kysely, Migrator, ParseJSONResultsPlugin, SqliteDialect } from 'kysely';
import logger from 'logging';
import fs from 'node:fs';
import path from 'node:path';
import { getDataPath } from 'scripts/data';
import { SqliteBooleanPlugin } from './plugins/boolean';
import { CustomMigrationProvider } from './plugins/provider';
import { InitializeDatabaseTables, isDatabaseInitialized } from './utilities/init';
import { RunMigrations, SkipToLatestMigration } from './utilities/migrator';

export const databasePath = path.join(getDataPath(), 'handbrake.db');
export const databaseVersion = 1;

const databaseFileExists = fs.existsSync(databasePath);

// Create a SQLite connection to the database
export const sqliteDatabase = new SQLite(databasePath, {});
sqliteDatabase.pragma('journal_mode = WAL');
sqliteDatabase.pragma('foreign_keys = ON');

// Create a Kysely connection to the SQLite database
export const database = new Kysely<Database>({
	dialect: new SqliteDialect({
		database: sqliteDatabase,
	}),
	plugins: [new ParseJSONResultsPlugin(), new SqliteBooleanPlugin()],
});

const migrator = new Migrator({
	db: database,
	// provider: new FileMigrationProvider({
	// 	fs: fs.promises,
	// 	path: path,
	// 	migrationFolder: path.resolve(__dirname, 'migrations'),
	// }),
	provider: new CustomMigrationProvider(),
	migrationTableName: 'migrations',
	migrationLockTableName: 'migrations_lock',
});

export async function DatabaseConnect() {
	try {
		const isInitialized = databaseFileExists && isDatabaseInitialized(sqliteDatabase);

		if (isInitialized) {
			// Run necessary migrations for existing databases to the latest schema
			await RunMigrations(migrator, sqliteDatabase);
		} else {
			// Initialize the database with the latest schema, skip prior migrations
			await InitializeDatabaseTables();
			await SkipToLatestMigration(migrator);
		}

		logger.info('[server] [database] The database is ready!');
	} catch (err) {
		logger.error(`[server] [database] Could not succesfully initialize the database.`);
		throw err;
	}
}

export async function DatabaseDisconnect() {
	try {
		sqliteDatabase.pragma('wal_checkpoint(full)');
		database.destroy();
		logger.info(`[server] [database] The database has been disconnected.`);
	} catch (error) {
		logger.error(`[server] [database] [error] Could not disconnect the database.`);
		logger.error(error);
	}
}

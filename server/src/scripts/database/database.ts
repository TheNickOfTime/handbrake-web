import type { Database } from '@handbrake-web/shared/types/database';
import SQLite from 'better-sqlite3';
import { Kysely, ParseJSONResultsPlugin, SqliteDialect } from 'kysely';
import logger from 'logging';
import path from 'path';
import { dataPath } from '../data';
import { InitializeDatabaseTables, isDatabaseInitialized } from './utilities/init';
import { CheckDatabaseVersion } from './utilities/version';

export const databasePath = path.join(dataPath, 'handbrake.db');

export const databaseVersion = 1;

// Create a SQLite connection to the database
export const sqliteDatabase = new SQLite(databasePath, {});
sqliteDatabase.pragma('journal_mode = WAL');
sqliteDatabase.pragma('foreign_keys = ON');

// Create a Kysely connection to the SQLite database
export const database = new Kysely<Database>({
	dialect: new SqliteDialect({
		database: sqliteDatabase,
	}),
	plugins: [new ParseJSONResultsPlugin()],
});

export async function DatabaseConnect() {
	try {
		// Check if database tables exist ----------------------------------------------------------
		const isInitialized = isDatabaseInitialized(sqliteDatabase);

		// Create the tables if they don't exist ---------------------------------------------------
		await InitializeDatabaseTables();

		// Check database version ------------------------------------------------------------------
		await CheckDatabaseVersion(sqliteDatabase, isInitialized);

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

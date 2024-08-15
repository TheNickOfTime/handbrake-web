import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';

import { dataPath } from '../data';
import { watcherTableCreateStatements } from 'scripts/database/database-watcher';
import { queueTableCreateStatements } from './database-queue';
import DatabaseMigrations from './migrations/database-migrations';

const databasePath = path.join(dataPath, 'handbrake.db');

export const databaseVersion = 1;

export let database: DatabaseType = new Database(databasePath, {});
database.pragma('journal_mode = WAL');
database.pragma('foreign_keys = ON');

export function DatabaseConnect() {
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
		CheckDatabaseVersion(databaseExists);

		console.log('[server] [database] The database connection has been initalized!');
	} catch (err) {
		console.error(err);
	}
}

function CheckDatabaseVersion(databaseExists: boolean) {
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
				DatabaseMigrations(currentVersion);
			} else if (currentVersion > databaseVersion) {
				console.error(
					`[server] [database] [error] The database's version is greater than the application's target version. The database cannot be downgraded and therefore cannot be loaded.`
				);
			}
		} catch {
			DatabaseMigrations(0);
		}
	} else {
		createVersionTableStatement.run();

		const insertVersionStatement = database.prepare<{ version: number }>(
			'INSERT INTO database_version(version) VALUES($version)'
		);
		insertVersionStatement.run({ version: databaseVersion });
	}
}

import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';

import { dataPath } from '../data';
import { watcherTableCreateStatements } from 'scripts/database/database-watcher';
import { queueTableCreateStatements } from './database-queue';

const databasePath = path.join(dataPath, 'handbrake.db');

export let database: DatabaseType = new Database(databasePath, {});
database.pragma('journal_mode = WAL');
database.pragma('foreign_keys = ON');

export function DatabaseConnect() {
	try {
		const tableCreateStatements = [
			...queueTableCreateStatements,
			'CREATE TABLE IF NOT EXISTS status(id TEXT NOT NULL, state INTEGER NOT NULL, PRIMARY KEY (id))',
			...watcherTableCreateStatements,
		]
			.map((statement) => statement.replace(/\t/gm, ''))
			.map((statement) => database.prepare(statement));

		// Create the tables if they don't exist
		tableCreateStatements.forEach((statement) => statement.run());
		console.log('[server] [database] The database connection has been initalized!');
	} catch (err) {
		console.error(err);
	}
}

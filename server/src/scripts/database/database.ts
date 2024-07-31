import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';

import { dataPath } from '../data';
import { watcherTableCreateStatement } from 'scripts/database/database-watcher';
import { queueTableCreateStatement } from './database-queue';

const databasePath = path.join(dataPath, 'handbrake.db');

export let database: DatabaseType = new Database(databasePath, {});

export function DatabaseConnect() {
	try {
		// Create the tables if they don't exist
		const initQueueStatement = [
			database.prepare(queueTableCreateStatement),
			database.prepare(
				'CREATE TABLE IF NOT EXISTS status(id TEXT NOT NULL, state INTEGER NOT NULL, PRIMARY KEY (id))'
			),
			database.prepare(watcherTableCreateStatement),
		];
		initQueueStatement.forEach((statement) => statement.run());
		console.log('[server] [database] The database connection has been initalized!');
	} catch (err) {
		console.error(err);
	}
}

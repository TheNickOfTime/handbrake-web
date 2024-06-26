import Database from 'better-sqlite3';
import path from 'path';

import { dataPath } from '../data';

const databasePath = path.join(dataPath, 'handbrake.db');

export let database: null | Database.Database = null;

export function DatabaseConnect() {
	try {
		const db = new Database(databasePath, {});

		// Create the queue table if it doesn't exist
		const initQueueStatement = [
			db.prepare(
				'CREATE TABLE IF NOT EXISTS queue(id TEXT NOT NULL, job TEXT NOT NULL, PRIMARY KEY (id))'
			),
			db.prepare(
				'CREATE TABLE IF NOT EXISTS status(id TEXT NOT NULL, state INTEGER NOT NULL, PRIMARY KEY (id))'
			),
		];
		initQueueStatement.forEach((statement) => statement.run());
		database = db;
		console.log('[server] [database] The database connection has been initalized!');
	} catch (err) {
		console.error(err);
	}
}

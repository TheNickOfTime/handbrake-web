import Database from 'better-sqlite3';
import path from 'path';

import { dataPath } from '../data';

const databasePath = path.join(dataPath, 'handbrake.db');

export let database = new Database(databasePath, {});

export function DatabaseConnect() {
	try {
		// Create the tables if they don't exist
		const initQueueStatement = [
			database.prepare(
				'CREATE TABLE IF NOT EXISTS queue(id TEXT NOT NULL, job TEXT NOT NULL, PRIMARY KEY (id))'
			),
			database.prepare(
				'CREATE TABLE IF NOT EXISTS status(id TEXT NOT NULL, state INTEGER NOT NULL, PRIMARY KEY (id))'
			),
		];
		initQueueStatement.forEach((statement) => statement.run());
		console.log('[server] [database] The database connection has been initalized!');
	} catch (err) {
		console.error(err);
	}
}

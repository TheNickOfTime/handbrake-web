import Database from 'better-sqlite3';
import path from 'path';

import { dataPath } from '../data';
import { Job, Queue, QueueEntry } from '../../../types/queue';
import { QueueTable } from '../../../types/database';

const databasePath = path.join(dataPath, 'handbrake.db');

export let database: null | Database.Database = null;

export function DatabaseConnect() {
	try {
		const db = new Database(databasePath, {});

		// if (!db) throw new Error('[database] [error] Could not connect to the database...');

		// Create the queue table if it doesn't exist
		const initQueueStatement = db.prepare(
			'CREATE TABLE IF NOT EXISTS queue(id TEXT NOT NULL, job TEXT NOT NULL, PRIMARY KEY (id))'
		);
		initQueueStatement.run();
		database = db;
		console.log('[server] [database] The database connection has been initalized!');
	} catch (err) {
		console.error(err);
	}
}

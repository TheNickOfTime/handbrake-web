import Database from 'better-sqlite3';
import path from 'path';

import { dataPath } from './data';
import { Job, Queue, QueueEntry } from '../../types/queue';
import { QueueTable } from '../../types/database';

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

export function GetQueueFromDatabase() {
	try {
		if (!database) throw new Error('[database] [error] There is no database connection...');

		const queueStatement = database.prepare<[], QueueTable>('SELECT * FROM queue');
		const queueTable = queueStatement.all();
		const queueResult = queueTable
			.map((entry) => {
				const newEntry: QueueEntry = {
					id: entry.id,
					job: JSON.parse(entry.job),
				};
				return newEntry;
			})
			.reduce<Queue>((prev, curr) => {
				prev[curr.id] = curr.job;
				return prev;
			}, {});
		console.log(
			`[server] [database] Retrieved ${
				Object.keys(queueResult).length
			} queue jobs from the database.`
		);
		return queueResult;
	} catch (err) {
		console.error(`[database] [error] Could not get jobs from the queue table.`);
		console.error(err);
		return null;
	}
}

export function GetJobFromDatabase(id: string): Job | undefined {
	try {
		if (!database) throw new Error('[database] [error] There is no database connection...');

		const jobStatement = database.prepare<{ id: string }, QueueTable>(
			'SELECT job FROM queue WHERE id = $id'
		);
		const jobQuery = jobStatement.get({ id: id });
		const jobResult: Job = jobQuery ? JSON.parse(jobQuery.job) : jobQuery;
		return jobResult;
	} catch (err) {
		console.error(`[database] [error] Could not get jobs from the queue table.`);
		console.error(err);
	}
}

export function InsertJobToDatabase(id: string, job: Job) {
	try {
		if (!database) throw new Error('[database] [error] There is no database connection...');

		const jobJSON = JSON.stringify(job);
		const insertStatement = database.prepare<QueueTable, QueueTable>(
			'INSERT INTO queue (id, job) VALUES ($id, $job)'
		);
		const insertResult = insertStatement.run({ id: id, job: jobJSON });
		console.log(`[server] [database] Successfully inserted job '${id}' into the database.`);
		return insertResult;
	} catch (err) {
		console.error(`[server] [error] [database] Could not insert job '${id}' into queue table.`);
		console.error(err);
	}
}

export function UpdateJobInDatabase(id: string, job: Job) {
	try {
		if (!database) throw new Error('[database] [error] There is no database connection...');

		const jobJSON = JSON.stringify(job);
		const updateStatement = database.prepare('UPDATE queue SET job = $job WHERE id = $id');
		const updateResult = updateStatement.run({ id: id, job: jobJSON });
		console.log(`[server] [database] Successfully updated job '${id}' in the database.`);
		return updateResult;
	} catch (err) {
		console.error(`[server] [error] [database] Could not update job '${id}'.`);
		console.error(err);
	}
}

export function RemoveJobFromDatabase(id: string) {
	try {
		if (!database) throw new Error('[database] [error] There is no database connection...');

		const removalStatement = database.prepare('DELETE FROM queue WHERE id = $id');
		const removalResult = removalStatement.run({ id: id });
		console.log(`[server] [database] Successfully removed job '${id}' from the database.`);
		return removalResult;
	} catch (err) {
		console.error(`[server] [error] [database] Could not remove job '${id}'.`);
		console.error(err);
	}
}

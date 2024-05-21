import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import path from 'path';

import { dataPath } from './data';
import { Job, Queue, QueueEntry } from '../../types/queue';

const databasePath = path.join(dataPath, 'handbrake.db');

export let database: null | Database<sqlite3.Database, sqlite3.Statement> = null;

async function InitializeDatabase(db: Database<sqlite3.Database, sqlite3.Statement>) {
	console.log(`[database] Initializing database at '${databasePath}'...`);

	await db.exec('CREATE TABLE queue(id TEXT NOT NULL, job TEXT NOT NULL, PRIMARY KEY (id))');
	// await db.exec('CREATE TABLE presets(id TEXT NOT NULL, preset TEXT NOT NULL, PRIMARY KEY (id))');

	console.log(`[database] Database initialized!`);
}

export async function DatabaseConnect() {
	const db = await open({
		filename: databasePath,
		driver: sqlite3.cached.Database,
	});

	sqlite3.verbose();

	try {
		await db.get('SELECT * FROM queue');
		console.log(
			`[server] [database] The database has already been initialized at '${databasePath}'.`
		);
	} catch (err) {
		InitializeDatabase(db);
	}

	database = db;
	// console.log(await GetQueueJobs());
}

export async function GetQueueFromDatabase(): Promise<Queue | null> {
	try {
		const result: Queue = (await database!.all('SELECT * FROM queue'))
			.map((entry) => {
				entry.job = JSON.parse(entry.job);
				return entry;
			})
			.reduce((prev, curr) => {
				prev[curr.id] = curr.job;
				return prev;
			}, {});
		// console.log(
		// 	`[server] [database] Retrieved ${
		// 		Object.keys(result!).length
		// 	} queue jobs from the database.`
		// );
		return result;
	} catch (err) {
		console.error(`[database] [error] Could not get jobs from the queue table.`);
		console.error(err);
		return null;
	}
}

export async function GetJobFromDatabase(id: string): Promise<Job | null> {
	try {
		const result: Job = await database!
			.get(`SELECT job FROM queue WHERE id = ${id}`)
			.then((data) => {
				// console.log(data);
				return JSON.parse(data.job);
			});
		// console.log(result);
		return result;
	} catch (err) {
		console.error(`[database] [error] Could not get jobs from the queue table.`);
		console.error(err);
		return null;
	}
}

export async function InsertJobToDatabase(id: string, job: Job) {
	try {
		const jobJSON = JSON.stringify(job);
		const result = await database?.run(
			`INSERT INTO queue (id, job) VALUES ('${id}', '${jobJSON}')`
		);
		console.log(`[server] [database] Successfully inserted job '${id}' into the database.`);
		return result;
	} catch (err) {
		console.error(`[server] [error] [database] Could not insert job '${id}' into queue table.`);
		console.error(err);
	}
}

export async function UpdateJobInDatabase(id: string, job: Job) {
	try {
		const jobJSON = JSON.stringify(job);
		const result = await database?.run(
			`UPDATE queue SET job = '${jobJSON}' WHERE id = '${id}'`
		);
		console.log(`[server] [database] Successfully updated job '${id}' in the database.`);
		return result;
	} catch (err) {
		console.error(`[server] [error] [database] Could not update job '${id}'.`);
		console.error(err);
	}
}

export async function RemoveJobFromDatabase(id: string) {
	try {
		const result = await database?.run(`DELETE FROM queue WHERE id = ${id}`);
		console.log(`[server] [database] Successfully removed job '${id}' from the database.`);
		return result;
	} catch (err) {
		console.error(`[server] [error] [database] Could not remove job '${id}'.`);
		console.error(err);
	}
}

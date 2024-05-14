import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { Job } from '../../types/queue';

const databasePath = './handbrake.db';

export let database: null | Database<sqlite3.Database, sqlite3.Statement> = null;

async function InitializeDatabase(db: Database<sqlite3.Database, sqlite3.Statement>) {
	console.log(`[database] Initializing database...`);

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
		console.log(`[server] [database] The database has already been initialized.`);
	} catch (err) {
		InitializeDatabase(db);
	}

	database = db;
	// console.log(await GetQueueJobs());
}

export async function GetQueueJobs() {
	try {
		let result = await database?.all('SELECT * FROM queue');
		if (result) {
			result = result.map((entry) => {
				entry.job = JSON.parse(entry.job);
				return entry;
			});
			result = result.reduce((prev, curr) => {
				prev[parseInt(curr.id)] = curr.job;
				return prev;
			}, {});
			console.log(
				`[server] [database] Retrieved ${
					Object.keys(result!).length
				} queue jobs from the database.`
			);
		}
		return result;
	} catch (err) {
		console.error(`[database] [error] Could not get jobs from the queue table.`);
		console.error(err);
	}
}

export async function InsertQueueJob(id: string, job: Job) {
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

export async function UpdateQueueJob(id: string, job: Job) {
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

export async function RemoveQueueJob(id: string) {
	try {
		const result = await database?.run(`DELETE FROM queue WHERE id = ${id}`);
		console.log(`[server] [database] Successfully removed job '${id}' from the database.`);
		return result;
	} catch (err) {
		console.error(`[server] [error] [database] Could not remove job '${id}'.`);
		console.error(err);
	}
}

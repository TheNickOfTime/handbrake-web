import { QueueTableType } from 'types/database.types';
import { JobType, QueueType, QueueEntryType } from 'types/queue.types';
import { database } from './database';

export function GetQueueFromDatabase() {
	try {
		const queueStatement = database.prepare<[], QueueTableType>('SELECT * FROM queue');
		const queueTable = queueStatement.all();
		const queueResult = queueTable
			.map((entry) => {
				const newEntry: QueueEntryType = {
					id: entry.id,
					job: JSON.parse(entry.job),
				};
				return newEntry;
			})
			.reduce<QueueType>((prev, curr) => {
				prev[curr.id] = curr.job;
				return prev;
			}, {});
		// console.log(
		// 	`[server] [database] Retrieved ${
		// 		Object.keys(queueResult).length
		// 	} queue jobs from the database.`
		// );
		return queueResult;
	} catch (err) {
		console.error(`[database] [error] Could not get jobs from the queue table.`);
		console.error(err);
	}
}

export function GetJobFromDatabase(id: string): JobType | undefined {
	try {
		const jobStatement = database.prepare<{ id: string }, QueueTableType>(
			'SELECT job FROM queue WHERE id = $id'
		);
		const jobQuery = jobStatement.get({ id: id });
		const jobResult: JobType = jobQuery ? JSON.parse(jobQuery.job) : jobQuery;
		return jobResult;
	} catch (err) {
		console.error(`[database] [error] Could not get jobs from the queue table.`);
		console.error(err);
	}
}

export function InsertJobToDatabase(id: string, job: JobType) {
	try {
		const jobJSON = JSON.stringify(job);
		const insertStatement = database.prepare<QueueTableType, QueueTableType>(
			'INSERT INTO queue (id, job) VALUES ($id, $job)'
		);
		const insertResult = insertStatement.run({ id: id, job: jobJSON });
		// console.log(`[server] [database] Successfully inserted job '${id}' into the database.`);
		return insertResult;
	} catch (err) {
		console.error(`[server] [error] [database] Could not insert job '${id}' into queue table.`);
		console.error(err);
	}
}

export function UpdateJobInDatabase(id: string, job: JobType) {
	try {
		const jobJSON = JSON.stringify(job);
		const updateStatement = database.prepare('UPDATE queue SET job = $job WHERE id = $id');
		const updateResult = updateStatement.run({ id: id, job: jobJSON });
		// console.log(`[server] [database] Successfully updated job '${id}' in the database.`);
		return updateResult;
	} catch (err) {
		console.error(`[server] [error] [database] Could not update job '${id}'.`);
		console.error(err);
	}
}

export function RemoveJobFromDatabase(id: string) {
	try {
		const removalStatement = database.prepare('DELETE FROM queue WHERE id = $id');
		const removalResult = removalStatement.run({ id: id });
		// console.log(`[server] [database] Successfully removed job '${id}' from the database.`);
		return removalResult;
	} catch (err) {
		console.error(`[server] [error] [database] Could not remove job '${id}'.`);
		console.error(err);
	}
}

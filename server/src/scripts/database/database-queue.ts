import {
	type AddJobType,
	type JobsOrderTable,
	type JobsStatusTable,
	type UpdateJobStatusType,
	type UpdateJobType,
} from '@handbrake-web/shared/types/database';
import type { NotNull } from 'kysely';
import logger from 'logging';
import { database } from './database';

const selectFromJobsSimple = database.selectFrom('jobs');
const selectFromJobsStatus = database.selectFrom('jobs_status');
const selectFromJobsOrder = database.selectFrom('jobs_order');
const selectFromJobsDetailed = database
	.selectFrom('jobs')
	.leftJoin('jobs_order', 'jobs.job_id', 'jobs_order.job_id')
	.leftJoin('jobs_status', 'jobs.job_id', 'jobs_status.job_id');

const getNextOrderIndex = async () =>
	(
		await database
			.selectFrom('jobs_order')
			.select(({ fn }) => fn.max('order_index').as('max'))
			.executeTakeFirstOrThrow()
	).max + 1;

export async function DatabaseGetDetailedJobs() {
	try {
		const jobs = await selectFromJobsDetailed
			.selectAll()
			.$narrowType<{ [index in keyof (JobsStatusTable & JobsOrderTable)]: NotNull }>()
			.execute();
		return jobs;
	} catch (err) {
		logger.error(`[database] [error] Could not get jobs from the queue table.`);
		throw err;
	}
}

export async function DatabaseGetDetailedJobByID(job_id: number) {
	try {
		const job = await selectFromJobsDetailed
			.where('job_id', '=', job_id)
			.selectAll()
			.$narrowType<{ [index in keyof (JobsStatusTable & JobsOrderTable)]: NotNull }>()
			.executeTakeFirstOrThrow();
		return job;
	} catch (err) {
		logger.error(`[database] [error] Could not get get the job '${job_id}' from the database.`);
		throw err;
	}
}

export async function DatabaseGetSimpleJobByID(job_id: number) {
	try {
		const job = await selectFromJobsSimple
			.where('job_id', '=', job_id)
			.selectAll()
			.executeTakeFirstOrThrow();
		return job;
	} catch (err) {
		logger.error(
			`[database] [error] Could not get data for '${job_id}' from the jobs_data table.`
		);
		throw err;
	}
}

export async function DatabaseGetJobStatusByID(job_id: number) {
	try {
		const status = await selectFromJobsStatus
			.where('job_id', '=', job_id)
			.selectAll()
			.executeTakeFirstOrThrow();

		return status;
	} catch (err) {
		logger.error(
			`[database] [error] Could not get the status for '${job_id}' from the jobs_status table.`
		);
		throw err;
	}
}

export async function DatabaseGetJobOrderIndexByID(job_id: number) {
	try {
		const orderIndex = (
			await selectFromJobsOrder
				.where('job_id', '=', job_id)
				.select('order_index')
				.executeTakeFirstOrThrow()
		).order_index;

		return orderIndex;
	} catch (err) {
		logger.error(
			`[database] [error] Could not get the order_index for '${job_id}' from the jobs_order table.`
		);
		throw err;
	}
}

export async function DatabaseInsertJob(values: AddJobType) {
	try {
		// Insert new row into the jobs table
		const newJob = await database
			.insertInto('jobs')
			.values(values)
			.returning('job_id')
			.executeTakeFirstOrThrow();

		// Insert a blank row into the jobs_status table
		await database
			.insertInto('jobs_status')
			.values({ job_id: newJob.job_id })
			.executeTakeFirstOrThrow();

		// Insert a new row into the jobs_order table
		const nextIndex = await getNextOrderIndex();
		await database
			.insertInto('jobs_order')
			.values({ job_id: newJob.job_id, order_index: nextIndex })
			.executeTakeFirstOrThrow();

		logger.info(
			`[server] [database] Inserted a new job with id '${newJob.job_id}' into the database at order index '${nextIndex}'.`
		);
		return newJob.job_id;
	} catch (err) {
		logger.error(
			`[server] [error] [database] Could not insert job with input file '${values.input_path}' into jobs table.`
		);
		throw err;
	}
}

export async function DatabaseInsertJobOrderByID(job_id: number) {
	try {
		const nextIndex = await getNextOrderIndex();
		const result = await database
			.insertInto('jobs_order')
			.values({ job_id: job_id, order_index: nextIndex })
			.executeTakeFirstOrThrow();

		logger.info(
			`[server] [database] Inserted existing job '${job_id}' back into the jobs_order table with order_index ${nextIndex}.`
		);

		return result;
	} catch (err) {
		logger.error(
			`[server] [error] [database] Could not insert job '${job_id}' into the jobs_order table.`
		);
		throw err;
	}
}

export async function DatabaseUpdateJob(job_id: number, data: UpdateJobType) {
	try {
		const result = await database
			.updateTable('jobs')
			.set(data)
			.where('job_id', '=', job_id)
			.executeTakeFirstOrThrow();

		return result;
	} catch (err) {
		logger.error(`[server] [error] [database] Could not update job '${job_id}'s data.`);
		throw err;
	}
}

export async function DatabaseUpdateJobStatus(job_id: number, status: UpdateJobStatusType) {
	try {
		const result = await database
			.updateTable('jobs_status')
			.set(status)
			.where('job_id', '=', job_id)
			.executeTakeFirstOrThrow();

		return result;
	} catch (err) {
		logger.error(`[server] [error] [database] Could not update job '${job_id}'s status.`);
		throw err;
	}
}

/**
 *
 * @param job_id
 * @param new_index When 0, removes from order entirely
 * @returns
 */
export async function DatabaseUpdateJobOrderIndex(job_id: number, new_index: number) {
	try {
		const previous_index = await DatabaseGetJobOrderIndexByID(job_id);

		if (previous_index == new_index) return;

		if (new_index > 0) {
			// Set the desired job to order -1 (so other jobs can be moved without conflict)
			database
				.updateTable('jobs_order')
				.set({ order_index: -1 })
				.where('job_id', '=', job_id);
		} else {
			// Delete the job from the table if the new index is 0
			database.deleteFrom('jobs_order').where('job_id', '=', job_id);
			logger.info(
				`[server] [database] Removing job with id '${job_id}' from the 'jobs_order' table.`
			);
		}

		// Get only the jobs that will need to be reordered, in the order they will be acted upon
		const isNewGreater = new_index > previous_index;
		const jobsToReorder = await database
			.selectFrom('jobs_order')
			.where('job_id', '!=', job_id)
			.where('order_index', '>', isNewGreater ? previous_index : new_index)
			.where('order_index', '<=', isNewGreater ? new_index : previous_index)
			.selectAll()
			.orderBy('order_index', isNewGreater ? 'desc' : 'asc')
			.execute();

		// Add the target job to the end of the reorder array
		jobsToReorder.push({ job_id: job_id, order_index: new_index });

		// Reorder all necessary jobs
		for await (const job of jobsToReorder) {
			const newJobOrderIndex = isNewGreater ? job.order_index - 1 : job.order_index + 1;

			await database
				.updateTable('jobs_order')
				.set({ order_index: newJobOrderIndex })
				.where('job_id', '=', job.job_id)
				.executeTakeFirstOrThrow();

			logger.info(
				`[server] [database] Updating job with id '${job.job_id}' from order index ${job.order_index} to ${newJobOrderIndex}.`
			);
		}
	} catch (err) {
		logger.error(
			`[server] [database] Could not reorder job with id '${job_id}' to '${new_index}'.`
		);
		throw err;
	}
}

export async function DatabaseRemoveJobByID(job_id: number) {
	try {
		await DatabaseUpdateJobOrderIndex(job_id, 0);
		const result = await database
			.deleteFrom('jobs')
			.where('job_id', '=', job_id)
			.executeTakeFirstOrThrow();

		logger.info(`[server] [database] Removed job '${job_id}' from the database.`);

		return result;
	} catch (err) {
		logger.error(`[server] [error] [database] Could not remove job '${job_id}'.`);
		throw err;
	}
}

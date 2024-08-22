import {
	JobOrderTableType,
	JobsTableType,
	JobsStatusTableType,
	JobInsertType,
	JobStatusInsertType,
} from 'types/database';
import { JobType, QueueType, JobDataType, JobStatusType, QueueRequestType } from 'types/queue';
import logger from 'logging';
import { database } from './database';
import { TranscodeStage } from 'types/transcode';

export const queueTableCreateStatements = [
	'CREATE TABLE IF NOT EXISTS jobs(\
		job_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
		input_path TEXT NOT NULL, \
		output_path TEXT NOT NULL, \
		preset_category TEXT NOT NULL, \
		preset_id TEXT NOT NULL \
		)',
	'CREATE TABLE IF NOT EXISTS jobs_status( \
		job_id INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE, \
		worker_id TEXT, \
		transcode_stage INTEGER DEFAULT 0, \
		transcode_percentage REAL DEFAULT 0, \
		transcode_eta INTEGER DEFAULT 0, \
		transcode_fps_current REAL DEFAULT 0, \
		transcode_fps_average REAL DEFAULT 0, \
		time_started INTEGER DEFAULT 0, \
		time_finished INTEGER DEFAULT 0 \
	)',
	'CREATE TABLE IF NOT EXISTS jobs_order( \
		job_id INTEGER NOT NULL REFERENCES job_ids(job_id) ON DELETE CASCADE, \
		order_index INTEGER NOT NULL UNIQUE \
	)',
];

const joinQueryToJob = (query: JobsTableType & JobsStatusTableType & JobOrderTableType) => {
	const job: JobType = {
		data: {
			input_path: query.input_path,
			output_path: query.output_path,
			preset_category: query.preset_category,
			preset_id: query.preset_id,
		},
		status: {
			worker_id: query.worker_id || undefined,
			transcode_stage: (query.transcode_stage || 0) satisfies TranscodeStage,
			transcode_percentage: query.transcode_percentage,
			transcode_eta: query.transcode_eta,
			transcode_fps_current: query.transcode_fps_current,
			transcode_fps_average: query.transcode_fps_average,
			time_started: query.time_started || undefined,
			time_finished: query.time_finished || undefined,
		},
		order_index: query.order_index,
	};
	return job;
};

export function GetQueueFromDatabase() {
	try {
		const statement = database.prepare<
			[],
			JobsTableType & JobsStatusTableType & JobOrderTableType
		>(
			'SELECT j.job_id, j.input_path, j.output_path, j.preset_category, j.preset_id, \
				s.worker_id, s.transcode_stage, s.transcode_percentage, s.transcode_eta, s.transcode_fps_current, \
				s.transcode_fps_average, s.time_started, s.time_finished, \
				o.order_index \
			FROM jobs j \
			LEFT JOIN jobs_status s ON j.job_id = s.job_id \
			LEFT JOIN jobs_order o ON j.job_id = o.job_id'
		);
		const result = statement.all();
		const queue: QueueType = Object.fromEntries(
			result.map((row) => {
				const job = joinQueryToJob(row);
				const result = [row.job_id, job];
				return result;
			})
		);
		return queue;
	} catch (err) {
		logger.error(`[database] [error] Could not get jobs from the queue table.`);
		console.error(err);
	}
}

export function GetJobFromDatabase(job_id: number): JobType | undefined {
	try {
		const statement = database.prepare<
			{ job_id: number },
			JobsTableType & JobsStatusTableType & JobOrderTableType
		>(
			'SELECT j.job_id, j.input_path, j.output_path, j.preset_category, j.preset_id, \
				s.worker_id, s.transcode_stage, s.transcode_percentage, s.transcode_eta, s.transcode_fps_current, \
				s.transcode_fps_average, s.time_started, s.time_finished, \
				o.order_index \
			FROM jobs j \
			LEFT JOIN jobs_status s ON j.job_id = s.job_id \
			LEFT JOIN jobs_order o ON j.job_id = o.job_id \
			WHERE j.job_id = $job_id'
		);
		const result = statement.get({ job_id: job_id });
		if (result) {
			return joinQueryToJob(result);
		}
	} catch (err) {
		logger.error(`[database] [error] Could not get get the job '${job_id}' from the database.`);
		console.error(err);
	}
}

export function GetJobDataFromTable(job_id: number): JobDataType | undefined {
	try {
		const statement = database.prepare<{ job_id: number }, JobsTableType>(
			'SELECT * FROM jobs WHERE job_id = $job_id'
		);
		const result = statement.get({ job_id: job_id });
		if (result) {
			const data: JobDataType = {
				input_path: result.input_path,
				output_path: result.output_path,
				preset_category: result.preset_category,
				preset_id: result.preset_id,
			};
			return data;
		}
	} catch (err) {
		logger.error(
			`[database] [error] Could not get data for '${job_id}' from the jobs_data table.`
		);
		console.error(err);
	}
}

export function GetJobStatusFromTable(job_id: number): JobStatusType | undefined {
	try {
		const statement = database.prepare<{ job_id: number }, JobsStatusTableType>(
			'SELECT * FROM jobs_status WHERE job_id = $job_id'
		);
		const result = statement.get({ job_id: job_id });
		if (result) {
			const status: JobStatusType = {
				worker_id: result.worker_id || null,
				transcode_stage: result.transcode_stage as TranscodeStage,
				transcode_percentage: result.transcode_percentage,
				transcode_eta: result.transcode_eta,
				transcode_fps_current: result.transcode_fps_current,
				transcode_fps_average: result.transcode_fps_average,
				time_started: result.time_started,
				time_finished: result.time_finished,
			};
			return status;
		}
	} catch (err) {
		logger.error(
			`[database] [error] Could not get the status for '${job_id}' from the jobs_status table.`
		);
		console.error(err);
	}
}

export function GetJobOrderIndexFromTable(job_id: number): number | undefined {
	try {
		const statement = database.prepare<{ job_id: number }, JobOrderTableType>(
			'SELECT order_index FROM jobs_order WHERE job_id = $job_id'
		);
		const result = statement.get({ job_id: job_id });
		if (result) {
			return result.order_index;
		}
	} catch (err) {
		logger.error(
			`[database] [error] Could not get the order_index for '${job_id}' from the jobs_order table.`
		);
		console.error(err);
	}
}

export function InsertJobToDatabase(request: QueueRequestType) {
	try {
		const dataStatement = database.prepare<JobInsertType>(
			'INSERT INTO jobs(input_path, output_path, preset_category, preset_id) \
			VALUES($input_path, $output_path, $preset_category, $preset_id)'
		);
		const dataResult = dataStatement.run({
			input_path: request.input,
			output_path: request.output,
			preset_category: request.category,
			preset_id: request.preset,
		});

		const job_id = database
			.prepare<{ rowid: number }, { rowid: number }>(
				'SELECT job_id FROM jobs WHERE rowid = $rowid'
			)
			.get({ rowid: dataResult.lastInsertRowid as number })!.rowid;

		const statusStatement = database.prepare<JobStatusInsertType>(
			'INSERT INTO jobs_status(job_id) VALUES($job_id)'
		);
		statusStatement.run({ job_id: job_id });

		const next_order_index = database
			.prepare<[], { 'COUNT(*)': number }>('SELECT COUNT(*) FROM job_ids AS count')
			.get()!['COUNT(*)'];

		const statement = database.prepare<JobOrderTableType>(
			'INSERT INTO jobs_order(job_id, order_index) VALUES($job_id, $order_index)'
		);
		const result = statement.run({ job_id: job_id, order_index: next_order_index });
		logger.info(
			`[server] [database] Inserting a new job with id '${job_id}' into the database.`
		);
		return job_id;
	} catch (err) {
		logger.error(
			`[server] [error] [database] Could not insert job with input file '${request.input}' into jobs table.`
		);
		console.error(err);
	}
}

export function InsertJobToJobsOrderTable(job_id: number) {
	try {
		const nextOrderIndex =
			database
				.prepare<[], { 'COUNT(*)': number }>('SELECT COUNT(*) FROM jobs_order AS count')
				.get()!['COUNT(*)'] + 1;

		const statement = database.prepare<{ job_id: number; orderIndex: number }>(
			'INSERT INTO jobs_order(job_id, order_index) VALUES($job_id, $orderIndex)'
		);
		const result = statement.run({ job_id: job_id, orderIndex: nextOrderIndex });
		logger.info(
			`[server] [database] Inserting existing job '${job_id}' back into the jobs_order table with order_index ${nextOrderIndex}.`
		);
		return result;
	} catch (err) {
		logger.error(
			`[server] [error] [database] Could not insert job '${job_id}' into the jobs_order table.`
		);
		console.error(err);
	}
}

export function UpdateJobDataInDatabase(job_id: number, data: JobDataType) {
	try {
		const updates = Object.entries(data)
			.filter((entry) => entry[1] != undefined)
			.map(([key, value]) => `${key} = ${typeof value == 'string' ? `'${value}'` : value}`)
			.join(', ');
		const statement = database.prepare<{ job_id: number }>(
			`UPDATE jobs_data SET ${updates} WHERE job_id = $job_id`
		);
		const result = statement.run({
			job_id: job_id,
		});

		return result;
	} catch (err) {
		logger.error(`[server] [error] [database] Could not update job '${job_id}'s data.`);
		console.error(err);
	}
}

export function UpdateJobStatusInDatabase(job_id: number, status: JobStatusType) {
	try {
		// logger.info(status);
		const updates = Object.entries(status)
			// .filter((entry) => entry[1] != undefined)
			.map(([key, value]) => `${key} = ${typeof value == 'string' ? `'${value}'` : value}`)
			.join(', ');
		const statement = database.prepare<{ job_id: number }>(
			`UPDATE jobs_status SET ${updates} WHERE job_id = $job_id`
		);
		const result = statement.run({
			job_id: job_id,
		});

		return result;
	} catch (err) {
		logger.error(`[server] [error] [database] Could not update job '${job_id}'s status.`);
		console.error(err);
	}
}

/**
 *
 * @param job_id
 * @param new_index When 0, removes from order entirely
 * @returns
 */
export function UpdateJobOrderIndexInDatabase(job_id: number, new_index: number) {
	const previous_index = GetJobOrderIndexFromTable(job_id)!;

	if (previous_index == new_index) return;

	const orderUpdateStatement = database.prepare<{ id: number; new_index: number }>(
		'UPDATE jobs_order SET order_index = $new_index WHERE job_id = $id'
	);

	const jobsStatement = database.prepare<{ id: number; new_index: number }, JobOrderTableType>(
		'SELECT * FROM jobs_order WHERE job_id != $id ORDER BY order_index ASC'
	);
	const reorderResult = jobsStatement.all({ id: job_id, new_index: new_index });

	if (new_index > 0) {
		orderUpdateStatement.run({ id: job_id, new_index: -1 });
		reorderResult.splice(new_index - 1, 0, { job_id: job_id, order_index: previous_index });
	} else {
		database.prepare('DELETE FROM jobs_order WHERE job_id = $id').run({ id: job_id });
		logger.info(
			`[server] [database] Removing job with id '${job_id}' from the 'jobs_order' table.`
		);
	}

	const rowsToUpdate = reorderResult
		.map((row, index) => ({ ...row, new_index: index + 1 }))
		.filter((row) => row.order_index != row.new_index || row.job_id == job_id)
		.sort((a, b) =>
			new_index > previous_index || new_index == 0
				? a.new_index - b.new_index
				: b.new_index - a.new_index
		);
	rowsToUpdate.forEach((row) => {
		orderUpdateStatement.run({ id: row.job_id, new_index: row.new_index });
		logger.info(
			`[server] [database] Updating job with id '${job_id}' from order index ${row.order_index} to ${row.new_index}`
		);
	});
}

export function RemoveJobFromDatabase(job_id: number) {
	try {
		UpdateJobOrderIndexInDatabase(job_id, 0);
		const removalStatement = database.prepare('DELETE FROM jobs WHERE job_id = $job_id');
		const removalResult = removalStatement.run({ job_id: job_id });
		logger.info(`[server] [database] Removed job '${job_id}' from the database.`);
		return removalResult;
	} catch (err) {
		logger.error(`[server] [error] [database] Could not remove job '${job_id}'.`);
		console.error(err);
	}
}

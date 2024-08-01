import {
	JobIDsTableType,
	JobOrderTableType,
	JobsDataTableType,
	JobsStatusTableType,
	QueueTableType,
} from 'types/database';
import {
	JobType,
	QueueType,
	QueueEntryType,
	JobDataType,
	JobStatusType,
	QueueRequestType,
} from 'types/queue';
import { database } from './database';
import { GetPresets } from 'scripts/presets';
import { TranscodeStage } from 'types/transcode';
import { string } from 'yaml/dist/schema/common/string';

export const queueTableCreateStatements = [
	'CREATE TABLE IF NOT EXISTS job_ids( \
		id TEXT NOT NULL PRIMARY KEY \
	)',
	'CREATE TABLE IF NOT EXISTS jobs_data(\
		job_id TEXT NOT NULL REFERENCES job_ids(id) ON DELETE CASCADE, \
		input_path TEXT NOT NULL, \
		output_path TEXT NOT NULL, \
		preset_id TEXT NOT NULL, \
		worker_id TEXT, \
		time_started INTEGER, \
		time_finished INTEGER \
	)',
	'CREATE TABLE IF NOT EXISTS jobs_status( \
		job_id TEXT NOT NULL REFERENCES job_ids(id) ON DELETE CASCADE, \
		transcode_stage INTEGER DEFAULT 0, \
		transcode_percentage REAL DEFAULT 0, \
		transcode_eta INTEGER, \
		transcode_fps_current REAL, \
		transcode_fps_average REAL \
	)',
	'CREATE TABLE IF NOT EXISTS jobs_order( \
		job_id TEXT NOT NULL REFERENCES job_ids(id) ON DELETE CASCADE, \
		order_index INTEGER NOT NULL UNIQUE \
	)',
];

const joinQueryToJob = (
	query: JobIDsTableType & JobsDataTableType & JobsStatusTableType & JobOrderTableType
) => {
	const job: JobType = {
		data: {
			input_path: query.input_path,
			output_path: query.output_path,
			preset_id: query.preset_id,
			worker_id: query.worker_id || undefined,
			time_started: query.time_started || undefined,
			time_finished: query.time_finished || undefined,
		},
		status: {
			transcode_stage: (query.transcode_stage || 0) satisfies TranscodeStage,
			transcode_percentage: query.transcode_percentage,
			transcode_eta: query.transcode_eta,
			transcode_fps_current: query.transcode_fps_current,
			transcode_fps_average: query.transcode_fps_average,
		},
		order_index: query.order_index,
	};
	return job;
};

export function GetQueueFromDatabase() {
	try {
		const statement = database.prepare<
			[],
			JobIDsTableType & JobsDataTableType & JobsStatusTableType & JobOrderTableType
		>(
			'SELECT * FROM job_ids \
			INNER JOIN jobs_data ON job_ids.id = jobs_data.job_id \
			INNER JOIN jobs_status ON job_ids.id = jobs_status.job_id \
			INNER JOIN jobs_order ON job_ids.id = jobs_order.job_id'
		);
		const result: QueueType = Object.fromEntries(
			statement.all().map((row) => {
				const job = joinQueryToJob(row);
				return [row.job_id, job];
			})
		);
		return result;
	} catch (err) {
		console.error(`[database] [error] Could not get jobs from the queue table.`);
		console.error(err);
	}
}

export function GetJobFromDatabase(id: string): JobType | undefined {
	try {
		const statement = database.prepare<
			{ id: string },
			JobIDsTableType & JobsDataTableType & JobsStatusTableType & JobOrderTableType
		>(
			'SELECT * FROM job_ids \
			INNER JOIN jobs_data ON job_ids.id = jobs_data.job_id \
			INNER JOIN jobs_status ON job_ids.id = jobs_status.job_id \
			INNER JOIN jobs_order ON job_ids.id = jobs_order.job_id \
			WHERE id = $id'
		);
		const result = statement.get({ id: id });
		if (result) {
			return joinQueryToJob(result);
		}
	} catch (err) {
		console.error(`[database] [error] Could not get get the job '${id}' from the database.`);
		console.error(err);
	}
}

export function GetJobDataFromTable(id: string): JobDataType | undefined {
	try {
		const statement = database.prepare<JobIDsTableType, JobsDataTableType>(
			'SELECT * FROM jobs_data WHERE job_id = $id'
		);
		const result = statement.get({ id: id });
		if (result) {
			const data: JobDataType = {
				input_path: result.input_path,
				output_path: result.output_path,
				preset_id: result.preset_id,
				worker_id: result.worker_id,
				time_started: result.time_started,
				time_finished: result.time_finished,
			};
			return data;
		}
	} catch (err) {
		console.error(
			`[database] [error] Could not get data for '${id}' from the jobs_data table.`
		);
		console.error(err);
	}
}

export function GetJobStatusFromTable(id: string): JobStatusType | undefined {
	try {
		const statement = database.prepare<JobIDsTableType, JobsStatusTableType>(
			'SELECT * FROM jobs_status WHERE job_id = $id'
		);
		const result = statement.get({ id: id });
		if (result) {
			const status: JobStatusType = {
				transcode_stage: result.transcode_stage as TranscodeStage,
				transcode_percentage: result.transcode_percentage,
				transcode_eta: result.transcode_eta,
				transcode_fps_current: result.transcode_fps_current,
				transcode_fps_average: result.transcode_fps_average,
			};
			return status;
		}
	} catch (err) {
		console.error(
			`[database] [error] Could not get the status for '${id}' from the jobs_status table.`
		);
		console.error(err);
	}
}

export function GetJobOrderIndexFromTable(id: string): number | undefined {
	try {
		const statement = database.prepare<JobIDsTableType, JobOrderTableType>(
			'SELECT order_index FROM jobs_order WHERE job_id = $id'
		);
		const result = statement.get({ id: id });
		if (result) {
			return result.order_index;
		}
	} catch (err) {
		console.error(
			`[database] [error] Could not get the order_index for '${id}' from the jobs_order table.`
		);
		console.error(err);
	}
}

export function InsertJobToDatabase(id: string, request: QueueRequestType) {
	try {
		const idStatement = database.prepare<JobIDsTableType>(
			'INSERT INTO job_ids(id) VALUES($id)'
		);
		idStatement.run({ id: id });

		const dataStatement = database.prepare<JobsDataTableType>(
			'INSERT INTO jobs_data(job_id, input_path, output_path, preset_id) \
			VALUES($job_id, $input_path, $output_path, $preset_id)'
		);
		dataStatement.run({
			job_id: id,
			input_path: request.input,
			output_path: request.output,
			preset_id: request.preset,
		});

		const statusStatement = database.prepare<JobsStatusTableType>(
			'INSERT INTO jobs_status(job_id) VALUES($job_id)'
		);
		statusStatement.run({ job_id: id });

		const next_order_index = database
			.prepare<[], { 'COUNT(*)': number }>('SELECT COUNT(*) FROM job_ids AS count')
			.get()!['COUNT(*)'];

		const orderStatement = database.prepare<JobOrderTableType>(
			'INSERT INTO jobs_order(job_id, order_index) VALUES($job_id, $order_index)'
		);
		orderStatement.run({ job_id: id, order_index: next_order_index });
	} catch (err) {
		console.error(`[server] [error] [database] Could not insert job '${id}' into queue table.`);
		console.error(err);
	}
}

export function UpdateJobDataInDatabase(id: string, data: JobDataType) {
	try {
		const updates = Object.entries(data)
			.filter((entry) => entry[1] != undefined)
			.map(([key, value]) => `${key} = ${typeof value == 'string' ? `'${value}'` : value}`)
			.join(', ');
		const statement = database.prepare<{ id: string }>(
			`UPDATE jobs_data SET ${updates} WHERE job_id = $id`
		);
		const result = statement.run({
			id: id,
		});

		return result;
	} catch (err) {
		console.error(`[server] [error] [database] Could not update job '${id}'s data.`);
		console.error(err);
	}
}

export function UpdateJobStatusInDatabase(id: string, status: JobStatusType) {
	try {
		const updates = Object.entries(status)
			.filter((entry) => entry[1] != undefined)
			.map(([key, value]) => `${key} = ${value}`)
			.join(', ');
		const statement = database.prepare<{ id: string }>(
			`UPDATE jobs_status SET ${updates} WHERE job_id = $id`
		);
		const result = statement.run({
			id: id,
		});

		return result;
		// console.log(result);
	} catch (err) {
		console.error(`[server] [error] [database] Could not update job '${id}'s status.`);
		console.error(err);
	}
}

export function UpdateJobOrderIndex(id: string, new_index: number) {
	const previous_index = GetJobOrderIndexFromTable(id)!;

	if (previous_index == new_index) return;

	const orderUpdateStatement = database.prepare<{ id: string; new_index: number }>(
		'UPDATE jobs_order SET order_index = $new_index WHERE job_id = $id'
	);

	const jobsStatement = database.prepare<{ id: string; new_index: number }, JobOrderTableType>(
		'SELECT * FROM jobs_order WHERE job_id != $id ORDER BY order_index ASC'
	);
	const reorderResult = jobsStatement.all({ id: id, new_index: new_index });
	reorderResult.splice(new_index - 1, 0, { job_id: id, order_index: previous_index });
	console.log(reorderResult);

	// console.log(`Updating '${id}' from ${previous_index} to -1`);
	orderUpdateStatement.run({ id: id, new_index: -1 });

	const rowsToUpdate = reorderResult
		.map((row, index) => ({ ...row, new_index: index + 1 }))
		.filter((row) => row.order_index != row.new_index || row.job_id == id)
		.sort((a, b) =>
			new_index > previous_index ? a.new_index - b.new_index : b.new_index - a.new_index
		)
		.forEach((row) => {
			// console.log(`Updating '${row.job_id}' from ${row.order_index} to ${row.new_index}`);
			orderUpdateStatement.run({ id: row.job_id, new_index: row.new_index });
		});
}

export function RemoveJobFromDatabase(id: string) {
	try {
		const removalStatement = database.prepare('DELETE FROM job_ids WHERE id = $id');
		const removalResult = removalStatement.run({ id: id });
		// console.log(`[server] [database] Successfully removed job '${id}' from the database.`);
		return removalResult;
	} catch (err) {
		console.error(`[server] [error] [database] Could not remove job '${id}'.`);
		console.error(err);
	}
}

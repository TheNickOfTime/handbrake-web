import type { JobsOrderTable, JobsStatusTable } from '@handbrake-web/shared/types/database';
import type { NotNull } from 'kysely';
import { database } from './database';

export async function Test() {
	try {
		const command = database
			.selectFrom('jobs')
			.leftJoin('jobs_order', 'jobs.job_id', 'jobs_order.job_id')
			.leftJoin('jobs_status', 'jobs.job_id', 'jobs_status.job_id')
			.selectAll()
			.$narrowType<{ [index in keyof (JobsStatusTable & JobsOrderTable)]: NotNull }>();

		// console.log(command.compile().sql);

		const test = await command.execute();

		console.log(
			test.map((thing) => ({ job_id: thing.job_id, order_index: thing.order_index }))
		);
	} catch (err) {
		throw err;
	}
}

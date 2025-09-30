import logger from 'logging';
import { database } from './database';

export async function DatabaseSelectStatusByID(id: string) {
	try {
		return (
			await database
				.selectFrom('status')
				.where('id', '=', id)
				.select('state')
				.executeTakeFirstOrThrow()
		).state;
	} catch (err) {
		logger.error(`[server] [database] [error] Could not get the status of '${id}'.`);
		throw err;
	}
}

export async function DatabaseUpdateStatus(id: string, state: number) {
	try {
		const result = await database
			.insertInto('status')
			.values({ id: id, state: state })
			.onConflict((builder) => builder.doUpdateSet({ state: state }))
			.executeTakeFirstOrThrow();

		logger.info(`[server] [database] Sucessfully updated the status of '${id}' to '${state}'.`);

		return result;
	} catch (err) {
		logger.error(`[server] [database] [error] Could not update the status of '${id}'.`);
		throw err;
	}
}

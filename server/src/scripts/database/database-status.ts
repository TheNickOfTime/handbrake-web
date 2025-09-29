import { type StatusTableType } from '@handbrake-web/shared/types/database';
import logger from 'logging';
import { sqliteDatabase } from './database';

// export function InitializeStatus() {
// 	const;
// }

export function GetStatusFromDatabase(id: string) {
	try {
		const statusStatement = sqliteDatabase.prepare<{ id: string }, StatusTableType>(
			'SELECT state FROM status WHERE id = $id'
		);
		const statusQuery = statusStatement.get({ id: id });
		return statusQuery;
	} catch (err) {
		logger.error(`[server] [database] [error] Could not get the status of '${id}'.`);
		logger.error(err);
	}
}

export function UpdateStatusInDatabase(id: string, state: number) {
	try {
		const updateStatement = sqliteDatabase.prepare(
			'INSERT INTO status (id, state) VALUES ($id, $state) ON CONFLICT (id) DO UPDATE SET state = $state'
		);
		updateStatement.run({ id: id, state: state });
		// logger.info(`[server] [database] Sucessfully updated the status of '${id}' to '${state}'.`);
	} catch (err) {
		logger.error(`[server] [database] [error] Could not update the status of '${id}'.`);
		logger.error(err);
	}
}

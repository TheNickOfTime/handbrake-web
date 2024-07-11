import { StatusTable } from 'types/database';
import { database } from './database';

// export function InitializeStatus() {
// 	const;
// }

export function GetStatusFromDatabase(id: string) {
	try {
		const statusStatement = database.prepare<{ id: string }, StatusTable>(
			'SELECT state FROM status WHERE id = $id'
		);
		const statusQuery = statusStatement.get({ id: id });
		return statusQuery;
	} catch (err) {
		console.error(`[server] [database] [error] Could not get the status of '${id}'.`);
		console.error(err);
	}
}

export function UpdateStatusInDatabase(id: string, state: number) {
	try {
		const updateStatement = database.prepare(
			'INSERT INTO status (id, state) VALUES ($id, $state) ON CONFLICT (id) DO UPDATE SET state = $state'
		);
		updateStatement.run({ id: id, state: state });
		console.log(`[server] [database] Sucessfully updated the status of '${id}' to '${state}'.`);
	} catch (err) {
		console.error(`[server] [database] [error] Could not update the status of '${id}'.`);
		console.error(err);
	}
}

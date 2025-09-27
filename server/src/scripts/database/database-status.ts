import logger from 'logging';
import { database } from './database';
import type { AddStatus, GetStatus } from './database-types';

// export function InitializeStatus() {
// 	const;
// }

export const initStatusTableSchema = [
	database.schema
		.createTable('status')
		.ifNotExists()
		.addColumn('id', 'text', (col) => col.notNull().primaryKey())
		.addColumn('state', 'integer', (col) => col.notNull()),
];

export async function GetStatusFromDatabase(id: GetStatus['id']) {
	try {
		return await database.selectFrom('status').where('id', '=', id).executeTakeFirstOrThrow();
	} catch (err) {
		logger.error(`[server] [database] [error] Could not get the status of '${id}'.`);
		throw err;
	}
}

export async function UpdateStatusInDatabase(newStatus: AddStatus) {
	try {
		return await database
			.insertInto('status')
			.values(newStatus)
			.onConflict((con) => con.doUpdateSet({ state: newStatus.state }))
			.execute();
	} catch (err) {
		logger.error(
			`[server] [database] [error] Could not update the status of '${newStatus.id}'.`
		);
		throw err;
	}
}

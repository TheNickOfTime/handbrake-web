import { Kysely } from 'kysely';
import logger from 'logging';

export async function up(db: Kysely<any>): Promise<void> {
	logger.info(`[database] [migration-2] Adding column 'start_queue' to the table 'watchers'.`);

	await db.schema
		.alterTable('watchers')
		.addColumn('start_queue', 'boolean', (col) => col.notNull().defaultTo(false))
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	logger.info(
		`[database] [migration-2] Removing the column 'start_queue' from the table 'watchers'.`
	);

	await db.schema.alterTable('watchers').dropColumn('start_queue').execute();
}

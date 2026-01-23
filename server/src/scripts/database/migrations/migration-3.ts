import { Kysely } from 'kysely';
import logger from 'logging';

export async function up(db: Kysely<any>): Promise<void> {
	logger.info(`[database] [migration-3] Adding column 'use_polling' to the table 'watchers'.`);

	await db.schema
		.alterTable('watchers')
		.addColumn('use_polling', 'boolean', (col) => col.notNull().defaultTo(false))
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	logger.info(
		`[database] [migration-3] Removing the column 'use_polling' from the table 'watchers'.`
	);

	await db.schema.alterTable('watchers').dropColumn('use_polling').execute();
}

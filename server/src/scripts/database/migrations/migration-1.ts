import { Kysely, sql } from 'kysely';
import logger from 'logging';

export async function up(db: Kysely<any>): Promise<void> {
	const versionTable = await sql`PRAGMA table_info(your_table_name);`.execute(db);

	if (versionTable) {
		logger.info(
			`[database] [migration-1] The table 'database_version' exists from the previous manual database migration system. This is no longer needed due to switching to using Kysely's migrations process. Dropping...`
		);

		await db.schema.dropTable('database_version').execute();
	}
}

export async function down(db: Kysely<any>): Promise<void> {
	// Migration code
}

import { type Database } from 'better-sqlite3';
import logger from 'logging';

export default function DatabaseMigration0(database: Database) {
	const tables = database
		.prepare<[], { name: string }>(
			`SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`
		)
		.all()
		.map((result) => result.name);
	if (!tables.includes('database_version')) {
		const transaction = database.transaction(() => {
			const tableCreateStatement = database.prepare(
				'CREATE TABLE IF NOT EXISTS database_version(version INT NOT NULL PRIMARY KEY)'
			);
			tableCreateStatement.run();
			logger.info(`[database] [migration-0] Created table 'database_version'.`);

			const insertVersionStatement = database.prepare(
				'INSERT INTO database_version(version) VALUES(0)'
			);
			insertVersionStatement.run();
			logger.info(
				`[database] [migration-0] Inserted version with value '0' into the table 'database-version'.`
			);
		});

		transaction();
	}
}

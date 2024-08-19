import logger from 'logging';
import { database, databaseVersion } from '../database';
import DatabaseMigration0 from './database-migration-0';
import DatabaseMigration1 from './database-migration-1';

export default function DatabaseMigrations(version: number) {
	try {
		logger.info(
			`[server] [database] [migration] The database_version is out of date, performing migrations for versions ${version} - ${databaseVersion}...`
		);
		for (let i = version + 1; i <= databaseVersion; i++) {
			RunDatabaseMigration(i);
		}
		logger.info(
			`[server] [database] [migrations] Database migrations have completed, the database_version is up to date.`
		);
	} catch (error) {
		logger.error(`[database] [migrations] Could not complete migrations.`);
		logger.error(error);
	}
}

function RunDatabaseMigration(version: number) {
	logger.info(
		`[server] [database] [migration] Running migration script for database_version ${version}...`
	);

	switch (version) {
		case 0:
			DatabaseMigration0(database);
			break;
		case 1:
			DatabaseMigration1(database);
			break;
	}

	const upgradeVersionStatement = database.prepare<{ version: number }>(
		'UPDATE database_version SET version = $version'
	);
	upgradeVersionStatement.run({ version: version });
	// logger.info(
	// 	`[server] [database] [migration] The database_version has been upgraded to version ${version}.`
	// );
}

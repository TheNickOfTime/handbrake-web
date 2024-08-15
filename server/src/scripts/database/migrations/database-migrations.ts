import { Database } from 'better-sqlite3';
import { database, databaseVersion } from '../database';
import DatabaseMigration0 from './database-migration-0';
import DatabaseMigration1 from './database-migration-1';

export default function DatabaseMigrations(version: number) {
	try {
		console.log(
			`[server] [database] [migration] The database_version is out of date, performing migrations...`
		);
		for (let i = version; i <= databaseVersion; i++) {
			RunDatabaseMigration(i);
		}
		console.log(
			`[server] [database] [migrations] Database migrations have completed, the database_version is up to date.`
		);
	} catch (error) {
		console.error(error);
	}
}

function RunDatabaseMigration(version: number) {
	console.log(
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
	// console.log(
	// 	`[server] [database] [migration] The database_version has been upgraded to version ${version}.`
	// );
}
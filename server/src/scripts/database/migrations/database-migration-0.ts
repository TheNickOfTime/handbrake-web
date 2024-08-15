import { Database } from 'better-sqlite3';

export default function DatabaseMigration0(database: Database) {
	database
		.prepare('CREATE TABLE IF NOT EXISTS database_version(version INT NOT NULL PRIMARY KEY)')
		.run();

	try {
		if (!database.prepare('SELECT version FROM database_version WHERE rowid = 1').get())
			throw new Error();
	} catch {
		database.prepare('INSERT INTO database_version(version) VALUES(0)').run();
	}
}

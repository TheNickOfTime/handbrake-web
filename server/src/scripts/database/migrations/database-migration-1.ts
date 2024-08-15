import { Database } from 'better-sqlite3';

export default function DatabaseMigration1(database: Database) {
	try {
		database.prepare('SELECT preset_category FROM jobs_data').get();
	} catch {
		const jobPresetCategoryStatement = database.prepare(
			'ALTER TABLE jobs_data ADD COLUMN preset_category TEXT'
		);
		jobPresetCategoryStatement.run();
	}

	try {
		database.prepare('SELECT preset_category FROM watchers');
	} catch {
		const watcherPresetCategoryStatement = database.prepare(
			'ALTER TABLE watchers ADD COLUMN preset_category TEXT'
		);
		watcherPresetCategoryStatement.run();
	}
}

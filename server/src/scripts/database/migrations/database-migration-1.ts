import { type Database } from 'better-sqlite3';
import logger from 'logging';

export default function DatabaseMigration1(database: Database) {
	const migrationTransaction = database.transaction(() => {
		database.pragma('foreign_keys = off');

		database.transaction(TransactionJobsDataPresetCategory)();
		database.transaction(TransactionJobIDFromStringToInt)();
		database.transaction(TransactionWatchersPresetCategory)();

		database.pragma('foreign_keys = on');
	});
	migrationTransaction();

	function TransactionJobsDataPresetCategory() {
		// Add preset_category column to jobs_data -----------------------------------------------------
		const jobs_data_columns = (
			database.pragma('table_info(jobs_data)') as { name: string }[]
		).map((info) => info.name);
		if (!jobs_data_columns.includes('preset_category')) {
			const transaction = database.transaction(() => {
				const jobPresetCategoryStatement = database.prepare(
					`ALTER TABLE jobs_data ADD COLUMN preset_category TEXT DEFAULT 'uncategorized'`
				);
				jobPresetCategoryStatement.run();
				logger.info(
					`[database] [migration-1] Added column 'preset_category' to table 'jobs_data' with a default value of 'uncategorized'.`
				);
			});

			transaction();
		}
	}

	function TransactionJobIDFromStringToInt() {
		// Convert job_id from string to integer -------------------------------------------------------
		const job_ids_type = database.pragma('table_info(job_ids)') as { type: string }[];
		if (job_ids_type[0].type == 'TEXT') {
			const transaction = database.transaction(() => {
				// rename old tables with old schema
				const oldTables = ['job_ids', 'jobs_data', 'jobs_status', 'jobs_order'];
				oldTables.forEach((table) => {
					const new_table = table + '_old';
					const renameOldTableStatment = database.prepare(
						`ALTER TABLE ${table} RENAME TO ${new_table}`
					);
					renameOldTableStatment.run();
					logger.info(
						`[database] [migration-1] Renamed table '${table}' to '${new_table}'.`
					);
				});

				// create new tables with new schema
				const createNewTableStatements = [
					'CREATE TABLE IF NOT EXISTS jobs(\
						job_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
						input_path TEXT NOT NULL, \
						output_path TEXT NOT NULL, \
						preset_category TEXT NOT NULL, \
						preset_id TEXT NOT NULL \
					)',
					'CREATE TABLE IF NOT EXISTS jobs_status( \
						job_id INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE, \
						worker_id TEXT, \
						transcode_stage INTEGER DEFAULT 0, \
						transcode_percentage REAL DEFAULT 0, \
						transcode_eta INTEGER DEFAULT 0, \
						transcode_fps_current REAL DEFAULT 0, \
						transcode_fps_average REAL DEFAULT 0, \
						time_started INTEGER DEFAULT 0, \
						time_finished INTEGER DEFAULT 0 \
					)',
					'CREATE TABLE IF NOT EXISTS jobs_order( \
						job_id INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE, \
						order_index INTEGER NOT NULL UNIQUE \
					)',
				].map((statement) => statement.replaceAll(/\t/g, ''));
				createNewTableStatements.forEach((statement) => {
					database.prepare(statement).run();
					const newTableName = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)\(/)![1];
					logger.info(
						`[database] [migration-1] Creating table with new schema '${newTableName}'.`
					);
				});

				database
					.prepare<[], { id: string }>('SELECT id FROM job_ids_old')
					.all()
					.forEach(({ id }) => {
						const slicedID = id.slice(-5);
						// Convert old string job_id to new integer job_id
						const insertJobStatement = database.prepare<{ job_id: string }>(
							'INSERT INTO jobs(input_path, output_path, preset_category, preset_id) \
						SELECT input_path, output_path, preset_category, preset_id \
						FROM jobs_data_old WHERE job_id = $job_id'
						);
						const insertJobResult = insertJobStatement.run({ job_id: id });
						const newID = database
							.prepare<{ rowid: number }, { job_id: number }>(
								'SELECT job_id FROM jobs WHERE rowid = $rowid'
							)
							.get({ rowid: insertJobResult.lastInsertRowid as number })!.job_id;
						logger.info(
							`[database] [migration-1] Copied data from 'jobs_data_old' for job ending with '${slicedID}' to 'jobs_data' with job_id '${newID}'.`
						);

						// Insert status to jobs_status with new integer id
						const insertStatusStatment = database.prepare<{
							new_id: number;
							old_id: string;
						}>(
							'INSERT INTO jobs_status(job_id, worker_id, transcode_stage, transcode_percentage, transcode_eta, transcode_fps_current, transcode_fps_average, time_started, time_finished) \
							SELECT $new_id, worker_id, transcode_stage, transcode_percentage, transcode_eta, transcode_fps_current, transcode_fps_average, time_started, time_finished \
							FROM jobs_status_old WHERE job_id = $old_id'
						);
						const insertStatusResult = insertStatusStatment.run({
							old_id: id,
							new_id: newID,
						});
						logger.info(
							`[database] [migration-1] Copied data from 'jobs_status_old' for job ending with '${slicedID}' to 'jobs_status' with job_id '${newID}'.`
						);

						const insertOrderStatement = database.prepare<{
							old_id: string;
							new_id: number;
						}>(
							'INSERT OR IGNORE INTO jobs_order(job_id, order_index) SELECT $new_id, order_index FROM jobs_order_old WHERE job_id = $old_id'
						);
						const insertOrderResult = insertOrderStatement.run({
							old_id: id,
							new_id: newID,
						});
						if (insertOrderResult.changes) {
							logger.info(
								`[database] [migration-1] Copied data from 'jobs_order_old' for job ending with '${slicedID}' to 'jobs_order' with job_id '${newID}'.`
							);
						}
					});

				const dropTables = [
					'job_ids_old',
					'jobs_data_old',
					'jobs_status_old',
					'jobs_order_old',
				];
				dropTables.forEach((table) => {
					const dropTableStatement = database.prepare(`DROP TABLE ${table}`);
					dropTableStatement.run();
					logger.info(`[database] [migration-1] Dropped table '${table}'.`);
				});
			});

			transaction();
		}
	}

	function TransactionWatchersPresetCategory() {
		// Add preset_category column to watcher table, then recreate the table ------------------------
		const watcher_columns = (database.pragma('table_info(watchers)') as { name: string }[]).map(
			(info) => info.name
		);
		if (!watcher_columns.includes('preset_category')) {
			const transaction = database.transaction(() => {
				// Add preset_category column
				const watcherPresetCategoryStatement = database.prepare(
					`ALTER TABLE watchers ADD COLUMN preset_category TEXT DEFAULT 'uncategorized'`
				);
				watcherPresetCategoryStatement.run();
				logger.info(
					`[database] [migration-1] Added column 'preset_category' to table 'watchers' with a default value of 'uncategorized'.`
				);

				const recreateWatcherTableStatment = database.prepare(
					'CREATE TABLE IF NOT EXISTS watchers_new( \
						watcher_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
						watch_path TEXT NOT NULL, \
						output_path TEXT, \
						preset_category TEXT NOT NULL, \
						preset_id TEXT NOT NULL \
					)'
				);
				recreateWatcherTableStatment.run();
				logger.info(
					`[database] [migration-1] Created table 'watchers_new' with new schema.`
				);

				const recreateWatcherRulesTableStatement = database.prepare(
					'CREATE TABLE IF NOT EXISTS watcher_rules_new( \
						watcher_id INT NOT NULL REFERENCES watchers_new(watcher_id) ON DELETE CASCADE, \
						rule_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
						name TEXT NOT NULL, \
						mask INTEGER NOT NULL, \
						base_rule_method INTEGER NOT NULL, \
						rule_method INTEGER NOT NULL, \
						comparison_method INTEGER NOT NULL, \
						comparison TEXT NOT NULL \
					)'
				);
				recreateWatcherRulesTableStatement.run();
				logger.info(
					`[database] [migration-1] Created table 'watcher_rules_new' that references watchers_new.`
				);

				const insertStatement = database.prepare(
					'INSERT INTO watchers_new(watcher_id, watch_path, output_path, preset_category, preset_id) SELECT watcher_id, watch_path, output_path, preset_category, preset_id FROM watchers'
				);
				const insertResult = insertStatement.run();
				logger.info(
					`[database] [migration-1] Copied ${insertResult.changes} rows from the table 'watchers' to the table 'watchers_new'.`
				);

				const insertRuleStatement = database.prepare(
					`INSERT INTO watcher_rules_new(watcher_id, rule_id, name, mask, base_rule_method, rule_method, comparison_method, comparison) SELECT watcher_id, rule_id, name, mask, base_rule_method, rule_method, comparison_method, comparison FROM watcher_rules`
				);
				const insertRulesResult = insertRuleStatement.run();
				logger.info(
					`[database] [migration-1] Copied ${insertRulesResult.changes} rows from the table 'watcher_rules' to 'watcher_rules_new'.`
				);

				database.prepare('DROP TABLE watchers').run();
				logger.info(`[database] [migration-1] Dropped table 'watchers'.`);

				database.prepare('DROP TABLE watcher_rules').run();
				logger.info(`[database] [migration-1] Dropped table 'watcher_rules'.`);

				database.prepare('ALTER TABLE watchers_new RENAME TO watchers').run();
				logger.info(`[database] [migration-1] Renamed 'watchers_new' to 'watchers'.`);

				database.prepare('ALTER TABLE watcher_rules_new RENAME TO watcher_rules').run();
				logger.info(
					`[database] [migration-1] Renamed 'watcher_rules_new' to 'watcher_rules'.`
				);
			});

			transaction();
		}
	}
}

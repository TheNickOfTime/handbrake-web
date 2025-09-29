import type { Database } from 'better-sqlite3';
import logger from 'logging';
import { database } from '../database';

export const isDatabaseInitialized = (sqlite: Database) => {
	return (
		sqlite
			.prepare(
				`SELECT name FROM sqlite_schema WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`
			)
			.all().length > 0
	);
};

export async function InitializeDatabaseTables() {
	logger.info(`[server] [database] Initializing the database tables...`);

	try {
		await database.schema
			.createTable('database_version')
			.ifNotExists()
			.addColumn('version', 'integer', (col) => col.notNull().primaryKey())
			.execute();
		logger.info(`[server] [database] Initialized the 'database_version' table.`);

		// Create the status table
		await database.schema
			.createTable('status')
			.ifNotExists()
			.addColumn('id', 'text', (col) => col.notNull().primaryKey())
			.addColumn('state', 'integer', (col) => col.notNull())
			.execute();
		logger.info(`[server] [database] Initialized the 'status' table.`);

		// Create the jobs table
		await database.schema
			.createTable('jobs')
			.ifNotExists()
			.addColumn('job_id', 'integer', (col) => col.notNull().primaryKey().autoIncrement())
			.addColumn('input_path', 'text', (col) => col.notNull())
			.addColumn('output_path', 'text', (col) => col.notNull())
			.addColumn('preset_category', 'text', (col) => col.notNull())
			.addColumn('preset_id', 'text', (col) => col.notNull())
			.execute();
		logger.info(`[server] [database] Initialized the 'jobs' table.`);

		// Create the jobs_status table
		await database.schema
			.createTable('jobs_status')
			.ifNotExists()
			.addColumn('job_id', 'integer', (col) =>
				col.notNull().references('jobs.job_id').onDelete('cascade')
			)
			.addColumn('worker_id', 'text')
			.addColumn('transcode_stage', 'integer', (col) => col.defaultTo(0))
			.addColumn('transcode_percentage', 'real', (col) => col.defaultTo(0))
			.addColumn('transcode_eta', 'integer', (col) => col.defaultTo(0))
			.addColumn('transcode_fps_current', 'real', (col) => col.defaultTo(0))
			.addColumn('transcode_fps_average', 'real', (col) => col.defaultTo(0))
			.addColumn('time_started', 'integer', (col) => col.defaultTo(0))
			.addColumn('time_finished', 'integer', (col) => col.defaultTo(0))
			.execute();
		logger.info(`[server] [database] Initialized the 'jobs_status' table.`);

		// Create the jobs_order table
		await database.schema
			.createTable('jobs_order')
			.ifNotExists()
			.addColumn('job_id', 'integer', (col) =>
				col.notNull().references('jobs.job_id').onDelete('cascade')
			)
			.addColumn('order_index', 'integer', (col) => col.notNull().unique())
			.execute();
		logger.info(`[server] [database] Initialized the 'jobs_order' table.`);

		// Create the watchers table
		await database.schema
			.createTable('watchers')
			.ifNotExists()
			.addColumn('watcher_id', 'integer', (col) => col.notNull().primaryKey().autoIncrement())
			.addColumn('watcher_path', 'text', (col) => col.notNull())
			.addColumn('output_path', 'text')
			.addColumn('preset-category', 'text', (col) => col.notNull())
			.addColumn('preset_id', 'text', (col) => col.notNull())
			.execute();
		logger.info(`[server] [database] Initialized the 'watchers' table.`);

		// Create the watcher_rules table
		await database.schema
			.createTable('watcher_rules')
			.ifNotExists()
			.addColumn('watcher_id', 'integer', (col) =>
				col.notNull().references('watchers.watcher_id').onDelete('cascade')
			)
			.addColumn('rule_id', 'integer', (col) => col.notNull().primaryKey().autoIncrement())
			.addColumn('name', 'text', (col) => col.notNull())
			.addColumn('mask', 'integer', (col) => col.notNull())
			.addColumn('base_rule_method', 'integer', (col) => col.notNull())
			.addColumn('rule_method', 'integer', (col) => col.notNull())
			.addColumn('comparison_method', 'integer', (col) => col.notNull())
			.execute();
		logger.info(`[server] [database] Initialized the 'watcher_rules' table.`);

		logger.info(`[server] [database] Successfully initialized all database tables!`);
	} catch (err) {
		logger.error('[server] [database] There was an issue initializing the database tables.');
		throw err;
	}
}

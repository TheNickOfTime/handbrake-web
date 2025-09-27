import SQLite from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import logger from 'logging';
import type { Database } from './database-types';

const sqlite = new SQLite('../data/handbrake-test.db');
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const database = new Kysely<Database>({
	dialect: new SqliteDialect({
		database: sqlite,
	}),
});

try {
	await database.schema
		.createTable('database_version')
		.ifNotExists()
		.addColumn('version', 'integer', (col) => col.notNull().primaryKey())
		.execute();

	// Create the status table
	await database.schema
		.createTable('status')
		.ifNotExists()
		.addColumn('id', 'text', (col) => col.notNull().primaryKey())
		.addColumn('state', 'integer', (col) => col.notNull())
		.execute();

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

	// Create the jobs_order table
	await database.schema
		.createTable('jobs_order')
		.ifNotExists()
		.addColumn('job_id', 'integer', (col) =>
			col.notNull().references('jobs.job_id').onDelete('cascade')
		)
		.addColumn('order_index', 'integer', (col) => col.notNull().unique())
		.execute();

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
} catch (err) {
	logger.error('[database] There was an issue creating the database.');
	throw err;
}

const testCommand = database.selectFrom('jobs').where('job_id', '=', 21).selectAll();

console.log((await testCommand.executeTakeFirstOrThrow()).input_path);

sqlite.pragma;

database.destroy();

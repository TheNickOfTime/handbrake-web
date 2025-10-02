import type { Database } from 'better-sqlite3';
import { Migrator } from 'kysely';
import logger from 'logging';
import { database } from '../database';
import { DatabaseBackup } from './backup';

export async function RunMigrations(migrator: Migrator, sqlite: Database) {
	// Get the number of migrations that need to be run
	const migrationsToRun = (await migrator.getMigrations()).filter(
		(migration) => !migration.executedAt
	);

	logger.info(
		`[database] [migration] Running ${migrationsToRun.length} migration${
			migrationsToRun.length != 1 ? 's' : ''
		}...`
	);

	// Backup the database before migrations
	if (migrationsToRun.length > 0) {
		await DatabaseBackup(sqlite, 'handbrake-migration-backup');
	}

	// Run migrations and check results
	const { error, results } = await migrator.migrateToLatest();

	results?.forEach((result) => {
		if (result.status == 'Success') {
			logger.info(`[database] [${result.migrationName}] Migration completed successfully.`);
		} else {
			logger.error(
				`[database] [${result.migrationName}] Migration was not completeed successfully/`
			);
		}
	});

	if (error) {
		logger.error(`[database] [error] Did not sucessfully complete all migrations.`);
		throw error;
	}

	logger.info(`[database] [migration] All migrations have completed.`);
}

export async function SkipToLatestMigration(migrator: Migrator) {
	const migrations = (await migrator.getMigrations()).map(({ name }) => name);

	for await (const migration of migrations) {
		database
			.insertInto('migrations')
			.values({ name: migration, timestamp: new Date().toISOString() })
			.execute();
	}

	logger.info(
		`[database] [migration] Marking all migrations up to '${migrations.at(-1)}' as completed.`
	);
}

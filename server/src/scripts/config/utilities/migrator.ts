import type { UnknownConfigType } from '@handbrake-web/shared/types/config';
import { readFile, writeFile } from 'fs/promises';
import logger from 'logging';
import { parse, stringify } from 'yaml';
import { configFilePath, ReadConfigFile } from '../config';

export type Migration = (config: UnknownConfigType) => Promise<UnknownConfigType>;

const migrationRegEx = /migration-(\d+)/;

const getMigrationNumber = (name: string) => {
	const match = name.match(migrationRegEx);

	const badMigrationError = new Error(
		`[migration] [error] The name '${name}' is not a valid migration script name.`
	);

	if (!match) {
		throw badMigrationError;
	}

	const number = parseInt(match[1]);

	if (isNaN(number)) {
		throw badMigrationError;
	}

	return number;
};

export async function RunMigrations(latestVersion: number) {
	const currentConfig = await ReadConfigFile();

	const version = (currentConfig.config.version as number) || 0;

	console.log(version);

	if (version < latestVersion) {
		// Get all migrations that need to be run
		const allMigrations = {
			'migration-1': (await import('../migrations/migration-1')).default as Migration,
			'migration-2': (await import('../migrations/migration-2')).default as Migration,
		};
		const neededMigrations = Object.fromEntries(
			Object.entries(allMigrations).filter(([key]) => {
				const migrationNumber = getMigrationNumber(key);
				return migrationNumber > version;
			})
		);

		logger.info(
			`[config] [migration] There are ${neededMigrations.length} config migrations to process.`
		);

		// Run each migration
		for await (const [name, migration] of Object.entries(neededMigrations)) {
			await RunMigration(name, migration);
		}

		logger.info(
			`[config] [migration] Successfully completed ${neededMigrations.length} migrations.`
		);
	} else {
		logger.info(`[config] [migration] The config file's schema (v${version}) is up to date.`);
	}
}

async function RunMigration(name: string, migration: Migration) {
	const migrationNumber = getMigrationNumber(name);

	try {
		const currentConfig = parse(
			await readFile(configFilePath, { encoding: 'utf-8' })
		) as UnknownConfigType;

		const migratedConfig = await migration(currentConfig);

		migratedConfig.config.version = migrationNumber;

		await writeFile(configFilePath, stringify(migratedConfig), {
			encoding: 'utf-8',
		});

		logger.info(`[config] [migration] Successfully completed '${name}'..`);
	} catch (err) {
		logger.error(`[config] [migration] Could not complete '${name}'.`);
		throw err;
	}
}

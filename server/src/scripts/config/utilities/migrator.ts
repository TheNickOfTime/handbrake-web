import type { UnknownConfigType } from '@handbrake-web/shared/types/config';
import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import logger from 'logging';
import path from 'path';
import { parse, stringify } from 'yaml';
import { configFilePath, ReadConfigFile } from '../config';

export type Migration = (config: UnknownConfigType) => Promise<UnknownConfigType>;

const migrationRegEx = /migration-(\d+).ts/;

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

	if (version < latestVersion) {
		// Get all migrations that need to be run
		const allMigrations = await Promise.all(
			await glob(path.resolve(__dirname, '../migrations/*.ts'))
		);
		const neededMigrations = allMigrations.filter((file) => {
			const migrationNumber = getMigrationNumber(file);
			return migrationNumber > version;
		});

		logger.info(
			`[config] [migration] There are ${neededMigrations.length} config migrations to process.`
		);

		// Run each migration
		for await (const migration of neededMigrations) {
			await RunMigration(migration);
		}

		logger.info(
			`[config] [migration] Successfully completed ${neededMigrations.length} migrations.`
		);
	} else {
		logger.info(`[config] [migration] The config file's schema (v${version}) is up to date.`);
	}
}

async function RunMigration(migrationPath: string) {
	const migrationNumber = getMigrationNumber(migrationPath);
	const migrationName = path.parse(migrationPath).name;

	try {
		const migration = (await import(migrationPath)).default as Migration;

		const currentConfig = parse(
			await readFile(configFilePath, { encoding: 'utf-8' })
		) as UnknownConfigType;

		const migratedConfig = await migration(currentConfig);

		migratedConfig.config.version = migrationNumber;

		await writeFile(configFilePath, stringify(migratedConfig), {
			encoding: 'utf-8',
		});

		logger.info(`[config] [migration] Successfully completed '${migrationName}}'..`);
	} catch (err) {
		logger.error(`[config] [migration] Could not complete '${migrationName}'.`);
		throw err;
	}
}

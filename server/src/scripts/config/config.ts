import { type ConfigType, type UnknownConfigType } from '@handbrake-web/shared/types/config';
import fs from 'fs';
import { readFile, writeFile } from 'fs/promises';
import logger from 'logging';
import path from 'path';
import { parse, stringify } from 'yaml';
import { EmitToAllClients } from '../connections';
import { dataPath } from '../data';
import { RunMigrations } from './utilities/migrator';

// Defines the latest config schema and default values
const defaultConfig = {
	config: {
		version: 1,
	},
	paths: {
		'media-path': '/video',
		'input-path': '/video',
		'output-path': '',
	},
	presets: {
		'show-default-presets': true,
		'allow-preset-creator': false,
	},
	application: {
		'check-interval': 12,
	},
};

export const configFilePath = path.join(dataPath, 'config.yaml');

// Initialize configuration with defaults
let config = JSON.parse(JSON.stringify(defaultConfig)) as ConfigType;

async function InitializeConfig() {
	const configData = stringify(defaultConfig);

	try {
		await writeFile(configFilePath, configData, { encoding: 'utf-8' });
		logger.info(
			`[server] [config] Created the config file at '${configFilePath}' with recommended defaults.`
		);
	} catch (err) {
		logger.error(`[config] Could not create the config file at '${configFilePath}'.`);
		throw err;
	}
}

export async function ReadConfigFile() {
	return parse(await readFile(configFilePath, { encoding: 'utf-8' })) as UnknownConfigType;
}

export async function WriteConfigFile(config: UnknownConfigType) {
	await writeFile(configFilePath, stringify(config), { encoding: 'utf-8' });
}

export async function LoadConfig() {
	try {
		if (!fs.existsSync(configFilePath)) {
			await InitializeConfig();
		} else {
			await RunMigrations(defaultConfig.config.version);
		}

		const configFile = (await ReadConfigFile()) as ConfigType;
		config = configFile;

		EmitToAllClients('config-update', config);
		logger.info(`[server] [config] The config file at '${configFilePath}' has been loaded.`);
	} catch (error) {
		logger.error(
			`[server] [config] [error] Could not load the config file from '${configFilePath}'. The application will now shut down.`
		);
		logger.error(error);
		// process.exit();
	}
}

export async function WriteConfig(newConfig: ConfigType) {
	try {
		const fileData = stringify(newConfig);
		await writeFile(configFilePath, fileData);

		config = newConfig;

		EmitToAllClients('config-update', newConfig);
		logger.info(`[server] [config] The config file at '${configFilePath}' has been written.`);
	} catch (error) {
		logger.error(`[server] [config] [error] Could not write new config to file.`);
		logger.error(error);
	}
}

export function GetConfig() {
	return config;
}

import fs from 'fs';
import { copyFile, readFile, writeFile } from 'fs/promises';
import logger from 'logging';
import path from 'path';
import { cwd } from 'process';
import { type ConfigType } from 'types/config';
import { parse, stringify } from 'yaml';
import { EmitToAllClients } from './connections';
import { dataPath } from './data';

const configPath = path.join(dataPath, 'config.yaml');
const templateConfig: ConfigType = parse(
	fs.readFileSync(path.resolve(cwd(), 'template/config.yaml'), 'utf-8')
);

let config: ConfigType = templateConfig;

export async function LoadConfig() {
	try {
		if (!fs.existsSync(configPath)) {
			logger.info(
				`[server] [config] No config file exists, copying the template config.yaml`
			);
			await copyFile(path.resolve(cwd(), 'template/config.yaml'), configPath);
		}

		const configFile = await readFile(configPath, 'utf-8');
		const configData = parse(configFile);

		const autoFixInConfig = configData['config'] && configData['config']['auto-fix'];
		const fixOnValidate = autoFixInConfig ? configData['config']['auto-fix'] : true;

		if (autoFixInConfig == null || autoFixInConfig == undefined) {
			logger.warn(
				`[server] [config] Config is missing property 'config/auto-fix', which will now automatically be set to 'true' in order to prevent application shutdown.`
			);
		}

		const validatedData = await ValidateConfig(configData, fixOnValidate);

		config = validatedData;

		EmitToAllClients('config-update', validatedData);
		logger.info(`[server] [config] The config file at '${configPath}' has been loaded.`);
	} catch (error) {
		logger.error(
			`[server] [config] [error] Could not load the config file from '${configPath}'. The application will now shut down.`
		);
		logger.error(error);
		// process.exit();
	}
}

export async function WriteConfig(newConfig: ConfigType) {
	try {
		const fileData = stringify(newConfig);
		await writeFile(configPath, fileData);

		config = newConfig;

		EmitToAllClients('config-update', newConfig);
		logger.info(`[server] [config] The config file at '${configPath}' has been written.`);
	} catch (error) {
		logger.error(`[server] [config] [error] Could not write new config to file.`);
		logger.error(error);
	}
}

export function GetConfig() {
	return config;
}

export async function ValidateConfig(inputConfig: ConfigType, fix: boolean = false) {
	let validatedConfig: ConfigType = JSON.parse(JSON.stringify(inputConfig));

	validatedConfig = ValidateConfigSections(validatedConfig, fix);
	validatedConfig = ValidateConfigProperties(validatedConfig, fix);

	if (JSON.stringify(validatedConfig) == JSON.stringify(inputConfig)) {
		logger.info(`[server] [config] [validation] The config data has passed validation.`);
	} else {
		await WriteConfig(validatedConfig);
		logger.info(
			`[server] [config] [validation] The config data has passed validation with fixes applied.`
		);
	}

	return validatedConfig;
}

export function ValidateConfigSections(inputConfig: ConfigType, fix: boolean = false) {
	// Find missing sections
	Object.keys(templateConfig).forEach((section) => {
		const value = inputConfig[section as keyof ConfigType];
		const isValid = value != null && value != undefined;

		if (!isValid) {
			if (fix) {
				inputConfig[section as keyof ConfigType] = templateConfig[
					section as keyof ConfigType
				] as typeof value;
				logger.info(
					`[server] [config] [validation] Adding missing section '${section}' to the config with template defaults.`
				);
			} else {
				throw new Error(
					`[server] [config] [validation] [error] Config is missing section '${section}'.`
				);
			}
		}
	});

	//Finding undesired sections
	Object.keys(inputConfig).forEach((section) => {
		const isValid = Object.keys(templateConfig).includes(section);

		if (!isValid) {
			if (fix) {
				delete inputConfig[section as keyof ConfigType];
				logger.info(
					`[server] [config] [validation] Removing undesired section '${section}' from the config.`
				);
			} else {
				throw new Error(
					`[server] [config] [validation] [error] Config has undesired section '${section}'.`
				);
			}
		}
	});

	return inputConfig;
}

export function ValidateConfigProperties(inputConfig: ConfigType, fix: boolean = false) {
	// Add missing properties
	Object.keys(templateConfig)
		.map((section) => section as keyof ConfigType)
		.forEach((section) => {
			const value = templateConfig[section];
			Object.keys(value)
				.map((property) => property as keyof typeof value)
				.forEach((property) => {
					const subValue = inputConfig[section][property];
					const isValid = subValue != null && subValue != undefined;

					if (!isValid) {
						if (fix) {
							inputConfig[section][property] = templateConfig[section][property];
							logger.info(
								`[server] [config] [validation] Adding missing property '${section}/${property}' to the config.`
							);
						} else {
							`[server] [config] [validation] [error] The config is missing property '${section}/${property}'.`;
						}
					}
				});
		});

	//Remove undesired properties
	Object.keys(inputConfig)
		.map((section) => section as keyof ConfigType)
		.forEach((section) => {
			const value = inputConfig[section];
			const templateValue = templateConfig[section];
			Object.keys(value).forEach((property) => {
				const isValid = Object.keys(templateValue).includes(property);

				if (!isValid) {
					if (fix) {
						delete inputConfig[section][property as keyof typeof value];
						logger.info(
							`[server] [config] [validation] Removing undesired property '${section}/${property}' from the config.`
						);
					} else {
						logger.error(
							`[server] [config] [validation] [error] Config has undesired property '${section}/${property}'.`
						);
					}
				}
			});
		});

	return inputConfig;
}

import fs from 'fs';
import { writeFile, copyFile, readFile } from 'fs/promises';
import path from 'path';
import { parse, stringify } from 'yaml';
import { ConfigPathsType, ConfigPresetsType, ConfigType } from 'types/config';
import { dataPath } from './data';
import { EmitToAllClients } from './connections';
import Shutdown from './shutdown';

const configPath = path.join(dataPath, 'config.yaml');
const templateConfig: ConfigType = parse(
	fs.readFileSync(path.resolve(__dirname, '../template/config.yaml'), 'utf-8')
);

let config: ConfigType = templateConfig;

export async function LoadConfig() {
	try {
		if (!fs.existsSync(configPath)) {
			console.log(
				`[server] [config] No config file exists, copying the template config.yaml`
			);
			await copyFile(path.resolve('src/template/config.yaml'), configPath);
		}

		const configFile = await readFile(configPath, 'utf-8');
		const configData = parse(configFile);
		const validatedData = await ValidateConfig(configData, true);

		config = validatedData;

		EmitToAllClients('config-update', validatedData);
		console.log(`[server] [config] The config file at '${configPath}' has been loaded.`);
		console.log(config);
	} catch (error) {
		console.error(
			`[server] [config] [error] Could not load the config file from '${configPath}'. The application will now shut down.`
		);
		console.error(error);
		process.exit();
	}
}

export async function WriteConfig(newConfig: ConfigType) {
	try {
		const fileData = stringify(newConfig);
		await writeFile(configPath, fileData);

		config = newConfig;

		EmitToAllClients('config-update', newConfig);
		console.log(`[server] [config] The config file at '${configPath}' has been written.`);
	} catch (error) {
		console.error(`[server] [config] [error] Could not write new config to file.`);
		console.error(error);
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
		console.log(`[server] [config] [validation] The config data has passed validation.`);
	} else {
		await WriteConfig(validatedConfig);
		console.log(
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
				console.log(
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
				console.log(
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
							console.log(
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
						console.log(
							`[server] [config] [validation] Removing undesired property '${section}/${property}' from the config.`
						);
					} else {
						console.error(
							`[server] [config] [validation] [error] Config has undesired property '${section}/${property}'.`
						);
					}
				}
			});
		});

	return inputConfig;
}

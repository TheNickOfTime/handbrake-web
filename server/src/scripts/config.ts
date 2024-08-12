import fs from 'fs';
import { writeFile, copyFile, readFile } from 'fs/promises';
import path from 'path';
import { parse, stringify } from 'yaml';
import { ConfigType } from 'types/config';
import { dataPath } from './data';
import { EmitToAllClients } from './connections';

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
		config = configData;
		EmitToAllClients('config-update', GetConfig());
		console.log(`[server] [config] The config file at '${configPath}' has been loaded.`);
	} catch (error) {
		console.error(
			`[server] [config] [error] Could not load the config file from '${configPath}'.`
		);
		console.error(error);
	}
}

export async function WriteConfig(newConfig: ConfigType) {
	try {
		const fileData = stringify(newConfig);
		await writeFile(configPath, fileData);
		console.log(`[server] [config] The config file at '${configPath}' has been written.`);
		LoadConfig();
	} catch (error) {
		console.error(`[server] [config] [error] Could not write new config to file.`);
		console.error(error);
	}
}

export function GetConfig() {
	return config;
}

// export function ValidateConfig<
// 	ConfigKey extends keyof ConfigType,
// 	CurrentConfigKey extends ConfigType[ConfigKey],
// 	ValidationKeys extends keyof ConfigValidationType,
// 	ValidationSubKeys extends keyof ConfigValidationType[ValidationKeys],
// 	CurrentValidationSubKey extends ConfigValidationType[ValidationKeys]
// >(inputConfig: ConfigType, updateConfig?: boolean) {
// 	const validationErrors = Object.keys(templateConfig)
// 		.map((key) => key as ValidationKeys)
// 		.reduce((object, key) => {
// 			object[key] = {
// 				isValid: true,
// 				children: Object.keys(templateConfig[key])
// 					.map((subKey) => subKey as ValidationSubKeys)
// 					.reduce((subObject, subKey) => {
// 						subObject[subKey] = true;
// 						return subObject;
// 					}, <{ [index in keyof CurrentValidationSubKey]: boolean }>{}),
// 			};
// 			return object;
// 		}, <{ [index in keyof ConfigValidationType]: { isValid: boolean; children: { [index in keyof CurrentValidationSubKey]: boolean } } }>{});

// 	// Checks for null and undefined values in the config
// 	const structureValidation =
// 		Object.keys(templateConfig).every((key) => {
// 			const value = Object.keys(inputConfig);
// 			const result = value && value.includes(key);

// 			if (!result) {
// 				validationErrors[key as keyof ConfigValidationType].isValid = false;
// 			}

// 			return result;
// 		}) &&
// 		Object.keys(templateConfig).every((key) =>
// 			Object.keys(templateConfig[key as keyof ConfigType]).every((subKey) => {
// 				const value = Object.keys(inputConfig[key as keyof ConfigType]);
// 				const result = value && value.includes(subKey);

// 				if (!result) {
// 					validationErrors[key as keyof ConfigValidationType].children[
// 						subKey as keyof CurrentValidationSubKey
// 					] = false;
// 				}

// 				return result;
// 			})
// 		);

// 	// Updates the config with missing values
// 	if (updateConfig) {
// 		Object.keys(validationErrors)
// 			.map((key) => key as keyof ConfigType)
// 			.forEach((key) => {
// 				if (!validationErrors[key].isValid) {
// 					inputConfig[key] = templateConfig[key] as keyof (
// 						| ConfigPathsType
// 						| ConfigPresetsType
// 					);
// 					console.log(
// 						`[server] [config] Adding missing section '${key}' to the config file. `
// 					);

// 					validationErrors[key].isValid = true;

// 					return;
// 				}
// 				Object.keys(validationErrors[key])
// 					.filter(
// 						(subKey) =>
// 							validationErrors[key].children[subKey as keyof CurrentValidationSubKey]
// 					)
// 					.forEach((subKey) => {
// 						console.log(
// 							`[server] [config] Adding missing config key '${key}/${subKey}' to the config file.`
// 						);
// 						inputConfig[key as keyof ConfigType][
// 							subKey as keyof (ConfigPathsType | ConfigPresetsType)
// 						] =
// 							templateConfig[key as keyof ConfigType][
// 								subKey as keyof (ConfigPathsType | ConfigPresetsType)
// 							];

// 						validationErrors[key].children[subKey as keyof CurrentValidationSubKey] =
// 							true;
// 					});
// 			});
// 		WriteConfig(inputConfig);
// 	}

// 	return validationErrors;
// }

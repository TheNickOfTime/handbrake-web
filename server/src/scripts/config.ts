import fs from 'fs';
import path from 'path';
import { parse, stringify } from 'yaml';
import { ConfigType } from 'types/config';
import { dataPath } from './data';

const configPath = path.join(dataPath, 'config.yaml');
const templateConfig: ConfigType = parse(
	fs.readFileSync(path.resolve(__dirname, '../template/config.yaml'), 'utf-8')
);

let config: ConfigType = templateConfig;

export function LoadConfig() {
	if (!fs.existsSync(configPath)) {
		console.log(`[server] [config] No config file exists, copying the template config.yaml`);
		fs.copyFileSync(path.resolve('src/template/config.yaml'), configPath);
	}

	const configFile = fs.readFileSync(configPath, 'utf-8');
	const configData = parse(configFile);
	config = configData;
}

export function WriteConfig(newConfig: ConfigType) {
	const fileData = stringify(newConfig);
	fs.writeFile(configPath, fileData, (err) => {
		if (err) {
			console.error(err);
		}
	});
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

import fs from 'fs';
import path from 'path';
import { parse } from 'yaml';
import { ConfigType, ConfigPropertyType } from 'types/config';
import { dataPath } from './data';

let config: ConfigType = {
	'input-path': '/video',
	'output-path': '/video',
};

export function LoadConfig() {
	const configPath = path.join(dataPath, 'config.yaml');

	if (!fs.existsSync(configPath)) {
		console.log(`[server] [config] No config file exists, copying the template config.yaml`);
		fs.copyFileSync(path.resolve(__dirname, '../template/config.yaml'), configPath);
	}

	const configFile = fs.readFileSync(configPath, 'utf-8');
	const configData = parse(configFile);
	config = configData;
}

function CreateConfig() {}

export function GetConfig() {
	return config;
}

export function GetPropertyFromConfig(property: ConfigPropertyType) {
	return config[property];
}

import fs from 'fs';
import path from 'path';
import { parse } from 'yaml';
import { Config, ConfigProperty } from 'types/config';
import { dataPath } from './data';

let config: Config = {
	'input-path': '/video',
	'output-path': '/video',
};

export function LoadConfig() {
	const configPath = path.join(dataPath, 'config.yaml');

	if (!fs.existsSync(configPath)) {
		console.log(`[server] [config] No config file exists, copying the template config.yaml`);
		fs.copyFileSync(path.resolve('template/config.yaml'), configPath);
	}

	const configFile = fs.readFileSync(configPath, 'utf-8');
	const configData = parse(configFile);
	config = configData;
}

function CreateConfig() {}

export function GetConfig() {
	return config;
}

export function GetPropertyFromConfig(property: ConfigProperty) {
	return config[property];
}

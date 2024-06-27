import fs from 'fs';
import { parse } from 'yaml';
import { Config, ConfigProperty } from 'types/config';

let config: Config = {
	'input-path': '/video',
	'output-path': '/video',
};

export function LoadConfig() {
	const configPath = '/workspaces/handbrake-web/config.yaml';
	const configFile = fs.readFileSync(configPath, 'utf-8');
	const configData = parse(configFile);
	config = configData;
}

export function GetConfig() {
	return config;
}

export function GetPropertyFromConfig(property: ConfigProperty) {
	return config[property];
}

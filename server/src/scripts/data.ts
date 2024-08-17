import { readFile, writeFile } from 'fs/promises';
import logger from 'logging';
import path from 'path';

export const dataPath = process.env.DATA_PATH || path.join(__dirname, '../../data');

export async function WriteDataToFile(path: string, data: object) {
	try {
		const json = JSON.stringify(data, undefined, '\t');
		await writeFile(path, json, { encoding: 'utf-8' });
		logger.info(`[server] [data] Data successfully written to file '${path}'`);
	} catch (err) {
		logger.error(`[server] [data] [error] Unable to write data to '${path}'`);
		logger.error(err);
	}
}

export async function ReadDataFromFile(path: string) {
	try {
		const json = await readFile(path, { encoding: 'utf-8' });
		const data = await JSON.parse(json);
		logger.info(`[server] [data] Successfully read data from '${path}'`);
		return data;
	} catch (err) {
		logger.error(`[server] [data] [error] Could not read data from '${path}'.`);
		logger.error(err);
	}
}

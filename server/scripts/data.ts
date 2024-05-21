import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export const dataPath = process.env.DATA_PATH || path.join(__dirname, '../../data');

export async function WriteDataToFile(path: string, data: object) {
	try {
		const json = JSON.stringify(data, undefined, '\t');
		await writeFile(path, json, { encoding: 'utf-8' });
		console.log(`[server] [data] Data successfully written to file '${path}'`);
	} catch (err) {
		console.error(`[server] [data] [error] Unable to write data to '${path}'`);
		console.error(err);
	}
}

export async function ReadDataFromFile(path: string) {
	try {
		const json = await readFile(path, { encoding: 'utf-8' });
		const data = await JSON.parse(json);
		console.log(`[server] [data] Successfully read data from '${path}'`);
		return data;
	} catch (err) {
		console.error(`[server] [data] [error] Could not read data from '${path}'.`);
		console.error(err);
	}
}

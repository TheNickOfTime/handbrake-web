import type { CreateConsoleLogger } from '@handbrake-web/shared/logger';
import { access, mkdir } from 'fs/promises';
import path from 'path';
import { cwd } from 'process';

export const getDataPath = () => process.env.DATA_PATH || '/tmp/handbrake-web';
export const getVideoPath = () => process.env.VIDEO_PATH || path.resolve(cwd(), '../video');

export async function InitializeDataPath(logger: ReturnType<typeof CreateConsoleLogger>) {
	try {
		await access(getDataPath());
		if (getDataPath().match(/^\/tmp/)) {
			logger.info(
				`The data directory '${getDataPath()}' is a child of '/tmp', but it already exists for some reason?`
			);
		} else {
			logger.info(
				`The data directory '${getDataPath()}' is not a child of '/tmp' and already exists.`
			);
		}
	} catch (err) {
		if (getDataPath().match(/^\/tmp/)) {
			try {
				logger.info(`Creating the data path at '${getDataPath()}'.`);
				mkdir(getDataPath());
			} catch (err) {
				logger.error(`[error] Could not create the data path at '${getDataPath()}'.`);
				throw err;
			}
		} else {
			logger.error(`[error] The data path '${getDataPath()}' does not exist.`);
			throw err;
		}
	}
}

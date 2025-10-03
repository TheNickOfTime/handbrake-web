import { CreateConsoleLogger } from '@handbrake-web/shared/logger';
import { readFile } from 'fs/promises';
import path from 'path';
import { env } from 'process';
import { Socket } from 'socket.io-client';

const logger = CreateConsoleLogger(env.WORKER_ID!);

export default logger;

export async function SendLogToServer(logPath: string, socket: Socket) {
	try {
		const logData = await readFile(logPath, { encoding: 'utf-8' });
		const logName = path.basename(logPath);
		socket.emit('send-log', logName, logData);
		logger.info(`[log] Sending the log '${logName}' to the server.`);
	} catch (error) {
		logger.error(`[log] Could not read/send the log at '${logPath}' to the server.`);
		console.error(error);
	}
}

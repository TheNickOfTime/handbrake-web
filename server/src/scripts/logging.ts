import { readdir, readFile, rm, writeFile } from 'fs/promises';
import path from 'path';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { dataPath } from './data';

export const logPath = path.join(dataPath, 'log');

export const formatJSON = (json: string) => {
	return json.replace(/"([^"]+)":/g, '$1:').replace(/:\s"([^"]+)"/g, ": '$1'");
};

const formatInfo = format((info) => {
	if (info.timestamp) {
		info.timestamp = new Date(info.timestamp).toLocaleTimeString('en-US', {
			hour12: false,
		});
	}

	switch (typeof info.message) {
		case 'string':
			const tagRegex = /\[[\w\d-]+\]\s?/g;
			const message = (info.message as string).match(/[^\n]+/);
			const tags = (message ? message[0] : (info.message as string)).match(tagRegex);
			if (tags) {
				const newMessage = (info.message as string).replaceAll(tagRegex, '');
				info.message = newMessage;

				if (
					info.label &&
					!tags.some((tag) => tag.match(new RegExp(`\\[${info.label}\\]`, 'g')))
				) {
					tags.splice(0, 0, `[${info.label}]`);
				}
				info.tags = tags.map((tag) => tag.trim()).join(' ');
			} else {
				info.tags = `[${info.label}]`;
			}

			const timeTagRegex = /\[\d{2}:\d{2}:\d{2}\]\s/g;
			if (info.message.match(timeTagRegex)) {
				info.message = (info.message as string).replaceAll(timeTagRegex, '');
			}
			break;
		case 'object':
			info.tags = `[${info.label}]`;
			info.message = formatJSON(JSON.stringify(info.message, null, 2));
			break;
		default:
			info.tags = `[${info.label}]`;
			break;
	}

	// console.log(info.tags);

	return info;
});

const formatCustomColorize = format((info) => {
	const color =
		info.level == 'error' ? '\x1b[31m' : info.level == 'warn' ? '\x1b[33m' : '\x1b[34m';

	info.label = `${color}${info.label}\x1B[39m`;

	if (info.timestamp) {
		info.timestamp = `\x1b[2m${info.timestamp}\x1B[22m`;
	}

	if (info.tags) {
		info.tags = `${color}${info.tags}\x1B[39m`;
	}

	if (typeof info.message == 'string' && info.message.match(/{[\s\n\r][^":]+:[\s\n\r]({|')/g)) {
		info.message = info.message.replaceAll(/:\s('.+')/g, ': \x1b[32m$1\x1B[39m');
	}
	return info;
});

const formatFinal = (transport: string) => {
	switch (transport) {
		case 'console':
			return format.printf((info) => `${info.timestamp} ${info.tags} ${info.message}`);
		case 'file':
			return format.printf(
				(info) => `${info.timestamp} ${info.tags} [${info.level}] ${info.message}`
			);
		default:
			return format.simple();
	}
};

const consoleFormatter = (label: string) =>
	format.combine(
		format.timestamp(),
		format.label({ label: label }),
		formatInfo(),
		formatCustomColorize(),
		formatFinal('console')
	);

const fileFormatter = (label: string) =>
	format.combine(
		format.timestamp(),
		format.label({ label: label }),
		formatInfo(),
		formatFinal('file')
	);

function CreateCustomLogger(label: string) {
	return createLogger({
		level: 'info',
		transports: [
			new transports.Console({ format: consoleFormatter(label) }),
			new DailyRotateFile({
				dirname: logPath,
				filename: 'server-%DATE%',
				extension: '.log',
				datePattern: 'YYYY-MM-DD',
				maxFiles: 5,
				format: fileFormatter(label),
			}),
		],
	});
}

const logger = CreateCustomLogger('server');

export default logger;

export async function WriteWorkerLogToFile(workerID: string, logName: string, logContents: string) {
	try {
		const newLogPath = path.join(logPath, logName);
		await writeFile(newLogPath, logContents);
		logger.info(
			`[log] Log file from worker '${workerID}' has been written to '${newLogPath}'.`
		);
	} catch (error) {
		logger.error(`[log] Could not write log to file at '${logPath}'.`);
		console.error(error);
	}
}

export async function GetJobLogByID(jobID: number) {
	try {
		const logs = await readdir(logPath);
		const log = logs.find((log) => log.includes(`job-${jobID}.log`));
		if (log) {
			return path.join(logPath, log);
		}
	} catch (error) {
		logger.error(`[log] Could not get a log for the job with ID '${jobID}'.`);
		console.error(error);
	}
}

export async function RemoveJobLogByID(jobID: number) {
	try {
		const logs = await readdir(logPath);
		const log = logs.find((log) => log.includes(`job-${jobID}.log`));
		if (log) {
			const newLogPath = path.join(logPath, log);
			await rm(newLogPath);
			logger.info(`[log] Removing a log for job '${jobID}' at '${newLogPath}'.`);
		}
	} catch (error) {
		logger.error(`[log] Could not remove a log for the job with ID '${jobID}'.`);
		console.error(error);
	}
}

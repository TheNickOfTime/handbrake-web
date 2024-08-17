import path from 'path';
import { createLogger, format, transports } from 'winston';
import { Logger, Logform, LeveledLogMethod } from 'winston';
import { dataPath } from './data';

interface CustomLeveledLogMethod extends LeveledLogMethod {
	(message: string, meta: { tags: string[] }): Logger;
}

interface CustomLogger extends Logger {
	info: CustomLeveledLogMethod;
}

const formatInfo = format((info) => {
	info.label = `[${info.label}]`;

	if (info.timestamp) {
		info.timestamp = new Date(info.timestamp).toLocaleTimeString('en-US', {
			hour12: false,
		});
	}

	if (info.tags) {
		info.tags = (info.tags as string[]).map((tag) => `[${tag}]`).join(' ');
	}

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

	return info;
});

const consoleFormatter = (label: string) =>
	format.combine(
		format.timestamp(),
		format.label({ label: label }),
		formatInfo(),
		formatCustomColorize(),
		format.printf((info) => {
			return `${info.timestamp} ${info.label} ${info.tags} ${info.message}`;
		})
	);

const fileFormatter = (label: string) =>
	format.combine(
		format.timestamp(),
		format.label({ label: label }),
		formatInfo(),
		format.printf((info) => {
			return `${info.timestamp} ${info.label} ${info.tags} [${info.level}] ${info.message}`;
		})
	);

export function CreateCustomLogger(label: string): CustomLogger {
	return createLogger({
		level: 'info',
		transports: [
			new transports.Console({ format: consoleFormatter(label) }),
			new transports.File({
				filename: path.join(dataPath, 'log/server.log'),
				format: fileFormatter(label),
			}),
		],
	});
}

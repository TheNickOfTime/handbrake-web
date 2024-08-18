import path from 'path';
import { createLogger, format, transports } from 'winston';
import { Logger, LeveledLogMethod } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { dataPath } from './data';

const formatInfo = format((info) => {
	if (info.timestamp) {
		info.timestamp = new Date(info.timestamp).toLocaleTimeString('en-US', {
			hour12: false,
		});
	}

	const tagRegex = /\[[\w\d]+\]\s?/g;
	const tags = (info.message as string).match(tagRegex);
	if (tags) {
		const newMessage = (info.message as string).replaceAll(tagRegex, '');
		info.message = newMessage;

		if (info.label && !tags.some((tag) => tag.match(new RegExp(`\\[${info.label}\\]`, 'g')))) {
			tags.splice(0, 0, `[${info.label}]`);
		}
		info.tags = tags.map((tag) => tag.trim()).join(' ');
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
			return `${info.timestamp} ${info.tags} ${info.message}`;
		})
	);

const fileFormatter = (label: string) =>
	format.combine(
		format.timestamp(),
		format.label({ label: label }),
		formatInfo(),
		format.printf((info) => {
			return `${info.timestamp} ${info.tags} [${info.level}] ${info.message}`;
		})
	);

function CreateCustomLogger(label: string) {
	return createLogger({
		level: 'info',
		transports: [
			new transports.Console({ format: consoleFormatter(label) }),
			new DailyRotateFile({
				dirname: path.join(dataPath, 'log'),
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

import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import TransportStream from 'winston-transport';

export interface CustomTransportType extends TransportStream {
	dirname?: string;
	filename?: string;
	_dest?: string;
}

export const formatJSON = (json: string) => {
	return json.replace(/"([^"]+)":/g, '$1:').replace(/:\s"([^"]+)"/g, ": '$1'");
};

const formatInfo = format((info) => {
	if (info.timestamp) {
		info.timestamp = new Date(info.timestamp as string).toLocaleTimeString('en-US', {
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
			if ((info.message as string).match(timeTagRegex)) {
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

export function CreateConsoleLogger(label: string) {
	return createLogger({
		level: 'info',
		transports: new transports.Console({ format: consoleFormatter(label) }),
	});
}

export function CreateFileLogger(label: string, fileName: string, filePath: string) {
	return createLogger({
		level: 'info',
		// format: format.simple(),
		transports: [
			new transports.Console({ format: consoleFormatter(label) }),
			new transports.File({
				dirname: filePath,
				filename: `${fileName}.log`,
				format: fileFormatter(label),
			}),
		],
	});
}

export function CreateRotatingFileLogger(label: string, fileName: string, filePath: string) {
	return createLogger({
		level: 'info',
		transports: [
			new transports.Console({ format: consoleFormatter(label) }),
			new DailyRotateFile({
				dirname: filePath,
				filename: `${fileName}-%DATE%`,
				extension: '.log',
				datePattern: 'YYYY-MM-DD',
				maxFiles: 5,
				format: fileFormatter(label),
			}),
		],
	});
}

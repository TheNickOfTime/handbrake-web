import { Socket } from 'socket.io-client';
import logger from 'logging';
import { currentJobID, StopTranscode } from 'scripts/transcode';

export function RegisterExitListeners(socket: Socket) {
	process.on('SIGINT', () => {
		logger.info(
			`[shutdown] The process has been interrupted, HandBrake Web will now begin to shutdown...`
		);
		Shutdown(socket);
	});

	process.on('SIGTERM', () => {
		logger.info(
			`[shutdown] The process has been terminated, HandBrake Web will now begin to shutdown...`
		);
		Shutdown(socket);
	});
}

export default async function Shutdown(socket: Socket) {
	try {
		if (currentJobID) {
			StopTranscode(currentJobID, socket);
		}

		socket.disconnect();

		logger.info(`[shutdown] Shutdown steps have completed.`);
	} catch (error) {
		logger.error(`[shutdown] Could not complete shutdown steps.`);
		console.error(error);
	}

	process.exit(0);
}

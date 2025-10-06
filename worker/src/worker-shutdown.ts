import logger from 'logging';
import { currentJobID, SelfStopTranscode } from 'scripts/transcode';
import { Socket } from 'socket.io-client';

let shutdownInProgress: Promise<void> | undefined;

export function RegisterExitListeners(socket: Socket) {
	process.on('SIGINT', async () => {
		if (!shutdownInProgress) {
			logger.info(
				`[shutdown] The process has been interrupted, HandBrake Web will now begin to shutdown...`
			);
			shutdownInProgress = Shutdown(socket);
		} else {
			logger.warn(
				`[shutdown] [warn] The process has been interrupted, but there is already a shutdown in progress.`
			);
		}
	});

	process.on('SIGTERM', async () => {
		if (!shutdownInProgress) {
			logger.info(
				`[shutdown] The process has been terminated, HandBrake Web will now begin to shutdown...`
			);
			shutdownInProgress = Shutdown(socket);
		} else {
			logger.warn(
				`[shutdown] [warn] The process has been terminated, but there is already a shutdown in progress.`
			);
		}
	});
}

export default async function Shutdown(socket: Socket) {
	try {
		if (currentJobID) {
			// await StopTranscode(currentJobID, socket);
			await SelfStopTranscode(socket);
		}

		socket.disconnect();

		logger.info(`[shutdown] Shutdown steps have completed.`);
	} catch (error) {
		logger.error(`[shutdown] Could not complete shutdown steps.`);
		throw error;
	}

	process.exit(0);
}

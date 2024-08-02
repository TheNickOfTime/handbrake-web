import { Socket } from 'socket.io-client';
import { currentJobID, StopTranscode } from './transcode';

export default function Shutdown(socket: Socket) {
	process.on('SIGINT', (signal) => {
		if (currentJobID) {
			StopTranscode(currentJobID, socket);
		}

		console.log(
			'[worker] The process has been interrupted, HandBrake Web will now shutdown...'
		);
		process.exit(0);
	});

	process.on('SIGTERM', (signal) => {
		if (currentJobID) {
			StopTranscode(currentJobID, socket);
		}

		console.log('[worker] The process has been terminated, HandBrake Web will now shutdown...');
		process.exit(0);
	});
}

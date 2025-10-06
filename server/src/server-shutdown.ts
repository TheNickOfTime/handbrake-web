import { Server as SocketServer } from 'socket.io';

import logger from 'logging';
import {
	DisconnectAllClientConnections,
	DisconnectAllWorkerConnections,
} from 'scripts/connections';
import { DatabaseDisconnect } from 'scripts/database/database';

export function RegisterExitListeners(socket: SocketServer) {
	process.on('SIGINT', () => {
		logger.info(
			`[server] [shutdown] The process has been interrupted, HandBrake Web will now begin to shutdown...`
		);
		Shutdown(socket);
	});

	process.on('SIGTERM', () => {
		logger.info(
			`[server] [shutdown] The process has been terminated, HandBrake Web will now begin to shutdown...`
		);
		Shutdown(socket);
	});
}

export default async function Shutdown(socket: SocketServer) {
	try {
		// Close all client and worker connections
		logger.info(`[shutdown] Closing all socket connections...`);
		DisconnectAllClientConnections();
		DisconnectAllWorkerConnections();

		// Shutdown the socket server
		await new Promise<void>((resolve) => {
			socket.close((err) => {
				if (err) throw err;
				resolve();
			});
		});

		await DatabaseDisconnect();
		logger.info(`[server] [shutdown] Shutdown steps have completed.`);
	} catch (error) {
		logger.error(`[server] [shutdown] [error] Could not complete shutdown steps.`);
		logger.error(error);
	}

	process.exit(0);
}

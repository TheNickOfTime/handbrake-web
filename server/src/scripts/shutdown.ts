import { Server } from 'node:http';
import { Server as SocketServer } from 'socket.io';

import { DatabaseDisconnect } from './database/database';

export default function Shutdown(socket: SocketServer) {
	process.on('SIGINT', () => {
		console.log(
			`[server] [shutdown] The process has been interrupted, HandBrake Web will now begin to shutdown...`
		);
		OnShutdown(socket);
	});

	process.on('SIGTERM', () => {
		console.log(
			`[server] [shutdown] The process has been terminated, HandBrake Web will now begin to shutdown...`
		);
		OnShutdown(socket);
	});
}

async function OnShutdown(socket: SocketServer) {
	try {
		// Shutdown the socket server
		await new Promise<void>((resolve) => {
			socket.close((err) => {
				if (err) throw err;
				resolve();
			});
		});

		await DatabaseDisconnect();
		console.log(`[server] [shutdown] Shutdown steps have completed.`);
	} catch (error) {
		console.error(`[server] [shutdown] [error] Could not complete shutdown steps.`);
		console.error(error);
	}

	process.exit(0);
}

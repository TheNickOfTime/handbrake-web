// import { Server } from 'socket.io';
import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';

import logger from 'logging';
import { LoadDefaultPresets, LoadPresets } from './presets';
import { InitializeQueue } from './queue';
import { DatabaseConnect } from './database/database';
import { InitializeWatchers } from './watcher';
import { LoadConfig } from './config';

export default async function Initialization(server: Server, socket: SocketServer) {
	// Config---------------------------------------------------------------------------------------
	await LoadConfig();

	// Presets -------------------------------------------------------------------------------------
	await LoadDefaultPresets();
	await LoadPresets();

	// Database ------------------------------------------------------------------------------------
	await DatabaseConnect();
	InitializeQueue();
	InitializeWatchers();

	// Start Server --------------------------------------------------------------------------------
	const url = process.env.SERVER_URL || 'http://localhost';
	const port = 9999;

	server.listen(port, () => {
		const hasPrefix = url.match(/^https?:\/\//);
		const serverAddress = `${hasPrefix ? url : 'http://' + url}:${port}`;
		logger.info(`[server] Available at '${serverAddress}'.`);
	});
	socket.attach(server);
}

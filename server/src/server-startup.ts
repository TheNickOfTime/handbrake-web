import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import logger from 'logging';
import { LoadConfig } from 'scripts/config/config';
import { DatabaseConnect } from 'scripts/database/database';
import { LoadDefaultPresets, LoadPresets } from 'scripts/presets';
import { InitializeQueue } from 'scripts/queue';
import { CheckForVersionUpdate } from 'scripts/version';
import { InitializeWatchers } from 'scripts/watcher';
import { Server as SocketServer } from 'socket.io';
import ClientSocket from 'socket/client-socket';
import WorkerSocket from 'socket/worker-socket';
import { routes } from './routes';
import { RegisterExitListeners } from './server-shutdown';

export default async function ServerStartup() {
	// Config---------------------------------------------------------------------------------------
	await LoadConfig();

	// Presets -------------------------------------------------------------------------------------
	await LoadDefaultPresets();
	await LoadPresets();

	// Database ------------------------------------------------------------------------------------
	await DatabaseConnect();
	await InitializeQueue();
	await InitializeWatchers();

	// Setup Server --------------------------------------------------------------------------------
	const app = express();
	const server = createServer(app);
	const socket = new SocketServer(server, {
		cors: {
			origin: '*',
		},
		pingTimeout: 5000,
	});

	app.use(cors());

	// Routes ------------------------------------------------------------------------------
	app.use(routes);

	// Socket Listeners --------------------------------------------------------------------
	ClientSocket(socket);
	WorkerSocket(socket);

	// Shutdown ------------------------------------------------------------------------------------
	RegisterExitListeners(socket);

	// Start Server --------------------------------------------------------------------------------
	const url = process.env.SERVER_URL || 'http://localhost';
	const port = 9999;

	await new Promise<void>((resolve) => {
		server.listen(port, () => {
			const hasPrefix = url.match(/^https?:\/\//);
			const serverAddress = `${hasPrefix ? url : 'http://' + url}:${port}`;
			logger.info(`[server] Available at '${serverAddress}'.`);
			resolve();
		});
		socket.attach(server);
	});

	// Check Version -------------------------------------------------------------------------------
	await CheckForVersionUpdate();
}

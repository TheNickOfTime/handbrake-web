// import { Server } from 'socket.io';
import { Server } from 'http';
import { ReadDataFromFile } from './data';
import { LoadPresets } from './presets';
import { InitializeQueue } from './queue';
import { DatabaseConnect } from './database/database';
import { InitializeWatchers } from './watcher';
import { LoadConfig } from './config';

export default async function Initialization(server: Server) {
	// Config---------------------------------------------------------------------------------------
	await LoadConfig();

	// Presets -------------------------------------------------------------------------------------
	await LoadPresets();

	// Database ------------------------------------------------------------------------------------
	DatabaseConnect();
	InitializeQueue();
	InitializeWatchers();

	// Start Server --------------------------------------------------------------------------------
	const url = process.env.SERVER_URL || 'http://localhost';
	const port = 9999;
	server.listen(port, () => {
		console.log(`[server] Available at http://${url}:${port}`);
	});
}

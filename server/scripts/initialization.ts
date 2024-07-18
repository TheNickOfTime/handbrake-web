// import { Server } from 'socket.io';
import { Server } from 'http';
import { ReadDataFromFile } from './data';
import { SetPresets, presetsPath } from './presets';
import { InitializeQueue } from './queue';
import { DatabaseConnect } from './database/database';
import { InitializeWatchers } from './watcher';

export default async function Initialization(server: Server) {
	// JSON ----------------------------------------------------------------------------------------
	const presets = await ReadDataFromFile(presetsPath);
	if (presets) {
		SetPresets(presets);
	}

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

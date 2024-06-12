// import { Server } from 'socket.io';
import { ReadDataFromFile } from './data';
import { SetPresets, presetsPath } from './presets';
import { UpdateQueue } from './queue';
import { DatabaseConnect } from './database';
import { Server } from 'http';

export default async function Initialization(server: Server) {
	// JSON ----------------------------------------------------------------------------------------
	const presets = await ReadDataFromFile(presetsPath);
	if (presets) {
		SetPresets(presets);
	}

	// Database ------------------------------------------------------------------------------------
	DatabaseConnect();
	UpdateQueue();

	// Start Server --------------------------------------------------------------------------------
	const url = process.env.SERVER_URL || 'http://localhost';
	const port = 9999;
	server.listen(port, () => {
		console.log(`[server] Available at http://${url}:${port}`);
	});
}

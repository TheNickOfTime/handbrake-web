import { Server } from 'socket.io';
import { ReadDataFromFile } from './data';
import { SetPresets, presetsPath } from './presets';
import { UpdateQueue } from './queue';
import { DatabaseConnect } from './database';

export default async function Initialization(io: Server) {
	// JSON ----------------------------------------------------------------------------------------
	const presets = await ReadDataFromFile(presetsPath);
	if (presets) {
		SetPresets(presets);
	}

	// Database ------------------------------------------------------------------------------------
	await DatabaseConnect();
	await UpdateQueue();

	// Start Server --------------------------------------------------------------------------------
	io.listen(9999);
	console.log(`[server] Available at http://localhost:9999`);
}

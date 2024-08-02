// import { Server } from 'socket.io';
import { Server } from 'http';
import { ReadDataFromFile } from './data';
import { SetPresets, presetsPath } from './presets';
import { InitializeQueue } from './queue';
import { DatabaseConnect } from './database/database';
import { InitializeWatchers } from './watcher';
import { GetQueueFromDatabase, InsertJobToDatabase } from './database/database-queue';

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

	// InsertJobToDatabase('job one', {
	// 	input: '/test/input/path',
	// 	output: '/test/output/path',
	// 	preset: 'Test Preset Name',
	// });
	// InsertJobToDatabase('job two', {
	// 	input: '/test/input/path',
	// 	output: '/test/output/path',
	// 	preset: 'Test Preset Name',
	// });
	// InsertJobToDatabase('job three', {
	// 	input: '/test/input/path',
	// 	output: '/test/output/path',
	// 	preset: 'Test Preset Name',
	// });
	// InsertJobToDatabase('job four', {
	// 	input: '/test/input/path',
	// 	output: '/test/output/path',
	// 	preset: 'Test Preset Name',
	// });
	// InsertJobToDatabase('job five', {
	// 	input: '/test/input/path',
	// 	output: '/test/output/path',
	// 	preset: 'Test Preset Name',
	// });
	// InsertJobToDatabase('job six', {
	// 	input: '/test/input/path',
	// 	output: '/test/output/path',
	// 	preset: 'Test Preset Name',
	// });
	console.log(Object.keys(GetQueueFromDatabase()!));

	// Start Server --------------------------------------------------------------------------------
	const url = process.env.SERVER_URL || 'http://localhost';
	const port = 9999;
	server.listen(port, () => {
		console.log(`[server] Available at http://${url}:${port}`);
	});
}

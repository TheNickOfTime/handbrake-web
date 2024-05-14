import { Server } from 'socket.io';
import { ReadDataFromFile } from './data';
import { SetPresets, presetsPath } from './presets';
import { SetQueue, queuePath } from './queue';
import { DatabaseConnect, GetQueueJobs } from './database';
import { Queue } from '../../types/queue';

export default async function Initialization(io: Server) {
	// JSON ----------------------------------------------------------------------------------------
	const presets = await ReadDataFromFile(presetsPath);
	if (presets) {
		SetPresets(presets);
	}

	// Database ------------------------------------------------------------------------------------
	await DatabaseConnect();

	const queue = await GetQueueJobs();
	if (queue) {
		SetQueue(queue);
	}

	io.listen(9999);
	console.log(`[server] Available at http://localhost:9999`);
}

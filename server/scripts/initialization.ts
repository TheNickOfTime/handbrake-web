import { Server } from 'socket.io';
import { ReadDataFromFile } from './data';
import { SetPresets, presetsPath } from './presets';
import { SetQueue, queuePath } from './queue';

export default async function Initialization(io: Server) {
	const presets = await ReadDataFromFile(presetsPath);
	if (presets) {
		SetPresets(presets);
	}

	const queue = await ReadDataFromFile(queuePath);
	if (queue) {
		SetQueue(queue);
	}

	io.listen(9999);
	console.log(`[server] Available at http://localhost:9999`);
}

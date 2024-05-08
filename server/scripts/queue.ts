import { Queue, QueueEntry } from '../../types/queue';
import { connections } from './connections';

export const queue: Queue = [];

export function AddEntry(data: QueueEntry) {
	queue.push(data);
	// console.log(`[server] Adding '${id} to queue.`);
	console.log(`[server] Queue: ${queue}`);
	connections.clients.forEach((client) => {
		client.emit('queue-update', queue);
	});
}

export function StartQueue() {
	connections.workers[0].emit('transcode');
}

import { connections } from './connections';

export const queue: string[] = [];

export function AddEntry(id: string) {
	queue.push(id);
	// console.log(`[server] Adding '${id} to queue.`);
	console.log(`[server] Queue: ${queue}`);
}

export function StartQueue() {
	connections.workers[0].emit('transcode');
}

import { Server } from 'socket.io';
import { AddEntry, StartQueue, queue } from '../scripts/queue';
import { QueueEntry } from '../../types/queue';
import { AddClient, RemoveClient, connections } from '../scripts/connections';

export default function ClientSocket(io: Server) {
	io.of('/client').on('connection', (socket) => {
		console.log(`[server] Client '${socket.id}' has connected.`);
		AddClient(socket);

		socket.on('disconnect', () => {
			console.log(`[server] Client '${socket.id}' has disconnected.`);
			RemoveClient(socket);
		});

		socket.on('add-to-queue', (data: QueueEntry) => {
			console.log(
				`[server] Client '${socket.id}' has requested to add a job for '${data.input}' to the queue.`
			);
			// console.log(data);
			AddEntry(data);
		});

		socket.on('start-queue', () => {
			StartQueue();
		});
	});
}

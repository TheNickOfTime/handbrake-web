import { Server } from 'socket.io';
import { AddEntry, StartQueue, queue } from '../scripts/queue';

export default function ClientSocket(io: Server) {
	io.of('/client').on('connection', (socket) => {
		console.log(`[server] Client '${socket.id}' has connected.`);

		socket.on('disconnect', () => {
			console.log(`[server] Client '${socket.id}' has disconnected.`);
		});

		socket.on('transcode-job', () => {
			console.log(`[server] Client '${socket.id}' has requested transcode. Adding to queue.`);
			AddEntry(socket.id);
		});

		socket.on('start-queue', () => {
			StartQueue();
		});
	});
}

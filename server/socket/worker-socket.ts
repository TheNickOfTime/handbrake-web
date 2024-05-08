import { Server } from 'socket.io';
import { AddWorker, RemoveWorker } from '../scripts/connections';

export default function WorkerSocket(io: Server) {
	io.of('/worker').on('connection', (socket) => {
		console.log(`[server] Worker '${socket.id}' has connected.`);
		AddWorker(socket);

		socket.on('disconnect', () => {
			console.log(`[server] Worker '${socket.id}' has disconnected.`);
			RemoveWorker(socket);
		});

		socket.on('transcoding', () => {
			console.log(`[server] Worker '${socket.id}' is transcoding.`);
		});
	});
}

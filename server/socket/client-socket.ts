import { Server } from 'socket.io';
import { AddJob, ClearQueue, StartQueue, StopQueue, queue } from '../scripts/queue';
import { QueueRequest } from '../../types/queue';
import { AddClient, RemoveClient, connections } from '../scripts/connections';
import { Client } from '../../types/socket';
import { GetDirectoryTree } from '../scripts/files';
import directoryTree from 'directory-tree';

const initClient = (socket: Client) => {
	socket.emit('queue-update', queue);
};

export default function ClientSocket(io: Server) {
	io.of('/client').on('connection', (socket) => {
		console.log(`[server] Client '${socket.id}' has connected.`);
		AddClient(socket);
		initClient(socket);

		socket.on('disconnect', () => {
			console.log(`[server] Client '${socket.id}' has disconnected.`);
			RemoveClient(socket);
		});

		socket.on('add-to-queue', (data: QueueRequest) => {
			console.log(
				`[server] Client '${socket.id}' has requested to add a job for '${data.input}' to the queue.`
			);
			// console.log(data);
			AddJob(data);
		});

		socket.on('start-queue', () => {
			StartQueue(socket.id);
		});

		socket.on('stop-queue', () => {
			StopQueue(socket.id);
		});

		socket.on('clear-queue', (finishedOnly: boolean) => {
			ClearQueue(socket.id, finishedOnly);
		});

		socket.on('get-directory-tree', () => {
			const tree = GetDirectoryTree('/workspaces/handbrake-web/video');
			socket.emit('get-directory-tree', tree);
		});
	});
}

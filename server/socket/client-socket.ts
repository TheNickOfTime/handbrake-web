import { Server } from 'socket.io';
import {
	AddJob,
	ClearQueue,
	GetQueue,
	GetQueueStatus,
	StartQueue,
	StopQueue,
} from '../scripts/queue';
import { QueueRequest } from '../../types/queue';
import { AddClient, RemoveClient } from '../scripts/connections';
import { Client } from '../../types/socket';
import { GetDirectoryTree } from '../scripts/files';
import { HandbrakePreset } from '../../types/preset';
import { AddPreset, GetPresetNames, GetPresets, RemovePreset } from '../scripts/presets';

const initClient = async (socket: Client) => {
	const queue = await GetQueue();
	socket.emit('queue-update', queue);
	socket.emit('presets-update', GetPresets());
	socket.emit('queue-status-update', GetQueueStatus());
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

		// Queue -----------------------------------------------------------------------------------
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

		// Directory -------------------------------------------------------------------------------
		socket.on('get-directory-tree', () => {
			const tree = GetDirectoryTree('/workspaces/handbrake-web/video');
			socket.emit('get-directory-tree', tree);
		});

		// Preset ----------------------------------------------------------------------------------
		socket.on('add-preset', (preset: HandbrakePreset) => {
			AddPreset(preset);
		});

		socket.on('remove-preset', (presetName: string) => {
			RemovePreset(presetName);
		});
	});
}

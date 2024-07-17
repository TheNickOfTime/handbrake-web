import { Server } from 'socket.io';
import {
	CreateDirectoryRequest,
	Directory,
	DirectoryItem,
	DirectoryRequest,
} from 'types/directory';
import { HandbrakePreset } from 'types/preset';
import { QueueRequest } from 'types/queue';
// import { Client } from 'types/socket';
import { Socket as Client } from 'socket.io';
import { AddClient, RemoveClient } from 'scripts/connections';
import { GetDirectoryItems, MakeDirectory } from 'scripts/files';
import { AddPreset, GetPresetNames, GetPresets, RemovePreset } from 'scripts/presets';
import {
	AddJob,
	ClearQueue,
	GetQueue,
	GetQueueStatus,
	RemoveJob,
	ResetJob,
	StartQueue,
	StopJob,
	StopQueue,
} from 'scripts/queue';
import { videoPath } from 'scripts/video';
import { Config, ConfigProperty } from 'types/config';
import { GetConfig, GetPropertyFromConfig } from 'scripts/config';
import { Watcher, WatcherWithRowID } from 'types/watcher';
import { GetWatchersFromDatabase } from 'scripts/database/database-watcher';
import { AddWatcher, RemoveWatcher } from 'scripts/watcher';

const initClient = (socket: Client) => {
	const queue = GetQueue();
	socket.emit('queue-update', queue);
	socket.emit('presets-update', GetPresets());
	socket.emit('queue-status-update', GetQueueStatus());
	socket.emit('watchers-update', GetWatchersFromDatabase());
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

		// Config ----------------------------------------------------------------------------------
		socket.on('get-config', (callback: (config: Config) => void) => {
			callback(GetConfig());
		});

		socket.on(
			'get-config-property',
			(property: ConfigProperty, callback: (result: string) => void) => {
				callback(GetPropertyFromConfig(property));
			}
		);

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

		// Jobs ------------------------------------------------------------------------------------
		socket.on('stop-job', (id: string) => {
			StopJob(id);
		});

		socket.on('reset-job', (id: string) => {
			ResetJob(id);
		});

		socket.on('remove-job', (id: string) => {
			RemoveJob(id);
		});

		// Directory -------------------------------------------------------------------------------
		socket.on(
			'get-directory',
			async (request: DirectoryRequest, callback: (directory: Directory) => void) => {
				const items = await GetDirectoryItems(request.path, request.isRecursive);
				if (items) {
					callback(items);
				}
			}
		);

		socket.on(
			'make-directory',
			async (item: CreateDirectoryRequest, callback: (result: boolean) => void) => {
				const result = await MakeDirectory(item.path, item.name);
				callback(result);
			}
		);

		// Preset ----------------------------------------------------------------------------------
		socket.on('add-preset', (preset: HandbrakePreset) => {
			AddPreset(preset);
		});

		socket.on('remove-preset', (presetName: string) => {
			RemovePreset(presetName);
		});

		// Watchers --------------------------------------------------------------------------------
		socket.on(
			'get-watchers',
			(callback: (watchers: WatcherWithRowID[] | undefined) => void) => {
				callback(GetWatchersFromDatabase());
			}
		);

		socket.on('add-watcher', (watcher: Watcher) => {
			AddWatcher(watcher);
		});

		socket.on('remove-watcher', (rowid: number) => {
			RemoveWatcher(rowid);
		});
	});
}

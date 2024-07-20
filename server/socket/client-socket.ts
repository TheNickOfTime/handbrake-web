import { Server } from 'socket.io';
import {
	CreateDirectoryRequestType,
	DirectoryType,
	DirectoryItemType,
	DirectoryRequestType,
	DirectoryItemsType,
} from 'types/directory.types';
import { HandbrakePresetType } from 'types/preset.types';
import { QueueRequestType } from 'types/queue.types';
// import { Client } from 'types/socket.types';
import { Socket as Client } from 'socket.io';
import { AddClient, RemoveClient } from 'scripts/connections';
import { CheckFilenameCollision, GetDirectoryItems, MakeDirectory } from 'scripts/files';
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
import { ConfigType, ConfigPropertyType } from 'types/config.types';
import { GetConfig, GetPropertyFromConfig } from 'scripts/config';
import { WatcherDefinitionType, WatcherDefinitionWithIDType } from 'types/watcher.types';
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
		socket.on('get-config', (callback: (config: ConfigType) => void) => {
			callback(GetConfig());
		});

		socket.on(
			'get-config-property',
			(property: ConfigPropertyType, callback: (result: string) => void) => {
				callback(GetPropertyFromConfig(property));
			}
		);

		// Queue -----------------------------------------------------------------------------------
		socket.on('add-to-queue', (data: QueueRequestType) => {
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
			async (request: DirectoryRequestType, callback: (directory: DirectoryType) => void) => {
				const items = await GetDirectoryItems(request.path, request.isRecursive);
				if (items) {
					callback(items);
				}
			}
		);

		socket.on(
			'make-directory',
			async (item: CreateDirectoryRequestType, callback: (result: boolean) => void) => {
				const result = await MakeDirectory(item.path, item.name);
				callback(result);
			}
		);

		socket.on(
			'check-name-collision',
			async (
				path: string,
				newItems: DirectoryItemsType,
				callback: (items: DirectoryItemsType) => void
			) => {
				const checkItems = await CheckFilenameCollision(path, newItems);
				callback(checkItems);
			}
		);

		// Preset ----------------------------------------------------------------------------------
		socket.on('add-preset', (preset: HandbrakePresetType) => {
			AddPreset(preset);
		});

		socket.on('remove-preset', (presetName: string) => {
			RemovePreset(presetName);
		});

		// Watchers --------------------------------------------------------------------------------
		socket.on(
			'get-watchers',
			(callback: (watchers: WatcherDefinitionWithIDType[] | undefined) => void) => {
				callback(GetWatchersFromDatabase());
			}
		);

		socket.on('add-watcher', (watcher: WatcherDefinitionType) => {
			AddWatcher(watcher);
		});

		socket.on('remove-watcher', (rowid: number) => {
			RemoveWatcher(rowid);
		});
	});
}

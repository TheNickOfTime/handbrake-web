import { Server } from 'socket.io';
import {
	CreateDirectoryRequestType,
	DirectoryType,
	DirectoryRequestType,
	DirectoryItemsType,
} from 'types/directory';
import { HandbrakePresetType } from 'types/preset';
import { QueueRequestType } from 'types/queue';
// import { Client } from 'types/socket';
import { Socket as Client } from 'socket.io';
import { AddClient, EmitToAllClients, RemoveClient } from 'scripts/connections';
import { CheckFilenameCollision, GetDirectoryItems, MakeDirectory } from 'scripts/files';
import {
	AddPreset,
	GetDefaultPresets,
	GetPresets,
	RemovePreset,
	RenamePreset,
} from 'scripts/presets';
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
	UpdateQueue,
} from 'scripts/queue';
import { ConfigType } from 'types/config';
import { GetConfig, WriteConfig } from 'scripts/config';
import {
	WatcherDefinitionObjectType,
	WatcherDefinitionType,
	WatcherDefinitionWithIDType,
	WatcherRuleDefinitionType,
} from 'types/watcher';
import { GetWatchersFromDatabase } from 'scripts/database/database-watcher';
import {
	AddWatcher,
	AddWatcherRule,
	RemoveWatcher,
	RemoveWatcherRule,
	UpdateWatcherRule,
} from 'scripts/watcher';
import {
	GetJobOrderIndexFromTable,
	UpdateJobOrderIndexInDatabase,
} from 'scripts/database/database-queue';

const initClient = (socket: Client) => {
	const queue = GetQueue();
	socket.emit('config-update', GetConfig());
	socket.emit('queue-update', queue);
	socket.emit('presets-update', GetPresets());
	socket.emit('default-presets-update', GetDefaultPresets());
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
		socket.on('config-update', async (config: ConfigType) => {
			await WriteConfig(config);
		});

		// Queue -----------------------------------------------------------------------------------
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
		socket.on('add-job', (data: QueueRequestType) => {
			console.log(
				`[server] Client '${socket.id}' has requested to add a job for '${data.input}' to the queue.`
			);
			AddJob(data);
		});

		socket.on('stop-job', (id: string) => {
			StopJob(id);
		});

		socket.on('reset-job', (id: string) => {
			ResetJob(id);
		});

		socket.on('remove-job', (id: string) => {
			RemoveJob(id);
		});

		socket.on('reorder-job', (id: string, newIndex: number) => {
			console.log(
				`[server] Client is requesting job at order index ${GetJobOrderIndexFromTable(
					id
				)} be reordered to index ${newIndex}.`
			);
			UpdateJobOrderIndexInDatabase(id, newIndex);
			UpdateQueue();
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
		socket.on('add-preset', (preset: HandbrakePresetType, category: string) => {
			AddPreset(preset, category);
		});

		socket.on('remove-preset', (presetName: string, category: string) => {
			RemovePreset(presetName, category);
		});

		socket.on('rename-preset', (oldName: string, newName: string, category: string) => {
			RenamePreset(oldName, newName, category);
		});

		// Watchers --------------------------------------------------------------------------------
		socket.on(
			'get-watchers',
			(callback: (watchers: WatcherDefinitionObjectType | undefined) => void) => {
				callback(GetWatchersFromDatabase());
			}
		);

		socket.on('add-watcher', (watcher: WatcherDefinitionType) => {
			console.log(watcher);
			AddWatcher(watcher);
		});

		socket.on('remove-watcher', (id: number) => {
			RemoveWatcher(id);
		});

		socket.on('add-watcher-rule', (watcherID: number, rule: WatcherRuleDefinitionType) => {
			AddWatcherRule(watcherID, rule);
		});

		socket.on('update-watcher-rule', (ruleID: number, rule: WatcherRuleDefinitionType) => {
			UpdateWatcherRule(ruleID, rule);
		});

		socket.on('remove-watcher-rule', (ruleID: number) => {
			RemoveWatcherRule(ruleID);
		});
	});
}

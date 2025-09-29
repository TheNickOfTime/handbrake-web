import { type ConfigType } from '@handbrake-web/shared/types/config';
import {
	type CreateDirectoryRequestType,
	type DirectoryItemsType,
	type DirectoryRequestType,
	type DirectoryType,
} from '@handbrake-web/shared/types/directory';
import { type HandbrakePresetType } from '@handbrake-web/shared/types/preset';
import { type QueueRequestType } from '@handbrake-web/shared/types/queue';
import { type GithubReleaseResponseType } from '@handbrake-web/shared/types/version';
import {
	type WatcherDefinitionObjectType,
	type WatcherDefinitionType,
	type WatcherRuleDefinitionType,
} from '@handbrake-web/shared/types/watcher';
import logger from 'logging';
import { GetConfig, WriteConfig } from 'scripts/config';
import { AddClient, RemoveClient } from 'scripts/connections';
import {
	GetJobOrderIndexFromTable,
	UpdateJobOrderIndexInDatabase,
} from 'scripts/database/database-queue';
import { GetWatchersFromDatabase } from 'scripts/database/database-watcher';
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
import { GetCurrentReleaseInfo, GetLatestReleaseInfo } from 'scripts/version';
import {
	AddWatcher,
	AddWatcherRule,
	RemoveWatcher,
	RemoveWatcherRule,
	UpdateWatcherRule,
} from 'scripts/watcher';
import { Socket as Client, Server } from 'socket.io';

const initClient = async (socket: Client) => {
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
		logger.info(`[socket] Client '${socket.id}' has connected.`);
		AddClient(socket);
		initClient(socket);

		socket.on('disconnect', () => {
			logger.info(`[socket] Client '${socket.id}' has disconnected.`);
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
			logger.info(
				`[socket] Client '${socket.id}' has requested to add a job for '${data.input}' to the queue.`
			);
			AddJob(data);
		});

		socket.on('stop-job', (jobID: number) => {
			StopJob(jobID);
		});

		socket.on('reset-job', (jobID: number) => {
			ResetJob(jobID);
		});

		socket.on('remove-job', (jobID: number) => {
			RemoveJob(jobID);
		});

		socket.on('reorder-job', (jobID: number, newOrderIndex: number) => {
			logger.info(
				`[socket] Client is requesting job at order index ${GetJobOrderIndexFromTable(
					jobID
				)} be reordered to index ${newOrderIndex}.`
			);
			UpdateJobOrderIndexInDatabase(jobID, newOrderIndex);
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

		// Version ---------------------------------------------------------------------------------
		socket.on(
			'get-current-version-info',
			async (callback: (info: GithubReleaseResponseType | null) => void) => {
				const info = await GetCurrentReleaseInfo();
				callback(info);
			}
		);

		socket.on(
			'get-latest-version-info',
			async (callback: (info: GithubReleaseResponseType | null) => void) => {
				const info = await GetLatestReleaseInfo();
				callback(info);
			}
		);

		// Watchers --------------------------------------------------------------------------------
		socket.on(
			'get-watchers',
			(callback: (watchers: WatcherDefinitionObjectType | undefined) => void) => {
				callback(GetWatchersFromDatabase());
			}
		);

		socket.on('add-watcher', (watcher: WatcherDefinitionType) => {
			logger.info(watcher);
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

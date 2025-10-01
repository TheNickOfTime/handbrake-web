import { type ConfigType } from '@handbrake-web/shared/types/config';
import type {
	AddJobType,
	AddWatcherRuleType,
	AddWatcherType,
	DetailedWatcherType,
	UpdateWatcherRuleType,
} from '@handbrake-web/shared/types/database';
import {
	type CreateDirectoryRequestType,
	type DirectoryItemsType,
	type DirectoryRequestType,
	type DirectoryType,
} from '@handbrake-web/shared/types/directory';
import { type HandbrakePresetType } from '@handbrake-web/shared/types/preset';
import { type GithubReleaseResponseType } from '@handbrake-web/shared/types/version';
import logger from 'logging';
import { GetConfig, WriteConfig } from 'scripts/config';
import { AddClient, RemoveClient } from 'scripts/connections';
import {
	DatabaseGetJobOrderIndexByID,
	DatabaseUpdateJobOrderIndex,
} from 'scripts/database/database-queue';
import { DatabaseGetDetailedWatchers } from 'scripts/database/database-watcher';
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
	socket.emit('config-update', GetConfig());
	socket.emit('queue-update', await GetQueue());
	socket.emit('presets-update', GetPresets());
	socket.emit('default-presets-update', GetDefaultPresets());
	socket.emit('queue-status-update', await GetQueueStatus());
	socket.emit('watchers-update', await DatabaseGetDetailedWatchers());
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
		socket.on('start-queue', async () => {
			await StartQueue(socket.id);
		});

		socket.on('stop-queue', async () => {
			await StopQueue(socket.id);
		});

		socket.on('clear-queue', async (finishedOnly: boolean) => {
			await ClearQueue(socket.id, finishedOnly);
		});

		// Jobs ------------------------------------------------------------------------------------
		socket.on('add-job', async (data: AddJobType, callback: () => void) => {
			logger.info(
				`[socket] Client '${socket.id}' has requested to add a job for '${data.input_path}' to the queue.`
			);
			await AddJob(data);
			callback();
		});

		socket.on('stop-job', async (jobID: number) => {
			await StopJob(jobID);
		});

		socket.on('reset-job', async (jobID: number) => {
			await ResetJob(jobID);
		});

		socket.on('remove-job', async (jobID: number) => {
			await RemoveJob(jobID);
		});

		socket.on('reorder-job', async (jobID: number, newOrderIndex: number) => {
			logger.info(
				`[socket] Client is requesting job at order index ${await DatabaseGetJobOrderIndexByID(
					jobID
				)} be reordered to index ${newOrderIndex}.`
			);
			await DatabaseUpdateJobOrderIndex(jobID, newOrderIndex);
			await UpdateQueue();
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
		socket.on('add-preset', async (preset: HandbrakePresetType, category: string) => {
			await AddPreset(preset, category);
		});

		socket.on('remove-preset', async (presetName: string, category: string) => {
			await RemovePreset(presetName, category);
		});

		socket.on('rename-preset', async (oldName: string, newName: string, category: string) => {
			await RenamePreset(oldName, newName, category);
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
			async (callback: (watchers: DetailedWatcherType[] | undefined) => void) => {
				const watchers = await DatabaseGetDetailedWatchers();
				console.log(watchers);
				callback(watchers);
			}
		);

		socket.on('add-watcher', async (watcher: AddWatcherType) => {
			logger.info(watcher);
			await AddWatcher(watcher);
		});

		socket.on('remove-watcher', async (id: number) => {
			await RemoveWatcher(id);
		});

		socket.on('add-watcher-rule', async (watcherID: number, rule: AddWatcherRuleType) => {
			await AddWatcherRule(watcherID, rule);
		});

		socket.on('update-watcher-rule', async (ruleID: number, rule: UpdateWatcherRuleType) => {
			await UpdateWatcherRule(ruleID, rule);
		});

		socket.on('remove-watcher-rule', async (ruleID: number) => {
			await RemoveWatcherRule(ruleID);
		});
	});
}

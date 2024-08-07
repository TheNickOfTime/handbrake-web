import chokidar from 'chokidar';
import mime from 'mime';
import path from 'path';
import {
	GetWatchersFromDatabase,
	InsertWatcherRuleToDatabase,
	InsertWatcherToDatabase,
	RemoveWatcherFromDatabase,
	RemoveWatcherRuleFromDatabase,
	UpdateWatcherRuleInDatabase,
} from './database/database-watcher';
import {
	WatcherDefinitionType,
	WatcherDefinitionWithIDType,
	WatcherDefinitionWithRulesType,
	WatcherRuleDefinitionType,
} from 'types/watcher';
import { EmitToAllClients } from './connections';
import { AddJob, GetQueue, RemoveJob } from './queue';
import { QueueRequestType } from 'types/queue';
import { CheckFilenameCollision } from './files';
import { TranscodeStage } from 'types/transcode';

const watchers: { [index: number]: chokidar.FSWatcher } = [];

export function RegisterWatcher(id: number, watcher: WatcherDefinitionWithRulesType) {
	const newWatcher = chokidar.watch(watcher.watch_path, {
		awaitWriteFinish: true,
		ignoreInitial: true,
		ignorePermissionErrors: true,
	});

	newWatcher.on('add', (path) => {
		onWatcherDetectFileAdd(watcher, path);
	});

	newWatcher.on('unlink', (path) => {
		onWatcherDetectFileDelete(watcher, path);
	});

	newWatcher.on('change', (path) => {
		onWatcherDetectFileChange(watcher, path);
	});

	newWatcher.on('error', (error) => {
		console.error(error);
	});

	watchers[id] = newWatcher;

	console.log(`[server] [watcher] Registered watcher for '${watcher.watch_path}'.`);
}

export async function DeregisterWatcher(id: number) {
	try {
		const directory = Object.entries(watchers[id].getWatched())[0].join('/');
		await watchers[id].close();
		console.log(`[server] [watcher] Deregistered watcher for '${directory}'.`);

		delete watchers[id];
	} catch (error) {
		console.error(
			`[server] [watcher] [error] Could not deregister watcher with rowid '${id}'.`
		);
		console.error(error);
	}
}

export function InitializeWatchers() {
	// const watchers = GetWatchersFromDatabase();
	// if (watchers) {
	// 	Object.keys(watchers).forEach((watcherID) => {
	// 		const parsedWatcherID = parseInt(watcherID);
	// 		RegisterWatcher(parsedWatcherID, watchers[parsedWatcherID]);
	// 	});
	// }
}

async function onWatcherDetectFileAdd(watcher: WatcherDefinitionType, filePath: string) {
	console.log(
		`[server] [watcher] Watcher for '${
			watcher.watch_path
		}' has detected the creation of the file '${path.basename(filePath)}'.`
	);

	const isVideo = mime.getType(filePath);
	if (isVideo && isVideo.includes('video')) {
		const parsedPath = path.parse(filePath);
		const outputPathBase = watcher.output_path ? watcher.output_path : parsedPath.dir;
		const outputPathName = parsedPath.name;
		const outputPathExtension = '.mkv';
		const outputPathFull = path.join(outputPathBase, outputPathName) + outputPathExtension;
		const checkedOutputPath = (
			await CheckFilenameCollision(outputPathBase, [
				{
					path: outputPathFull,
					name: outputPathName,
					extension: outputPathExtension,
					isDirectory: false,
				},
			])
		)[0].path;
		console.log(checkedOutputPath);
		const newJobRequest: QueueRequestType = {
			input: filePath,
			output: checkedOutputPath,
			preset: watcher.preset_id,
		};
		console.log(
			`[server] [watcher] Watcher for '${watcher.watch_path}' is requesting a new job be made for the video file '${parsedPath.base}'.`
		);
		AddJob(newJobRequest);
	}
}

function onWatcherDetectFileDelete(watcher: WatcherDefinitionType, filePath: string) {
	console.log(
		`[server] [watcher] Watcher for '${
			watcher.watch_path
		}' has detected the removal of the file/directory '${path.basename(filePath)}'.`
	);

	const isVideo = mime.getType(filePath);
	if (isVideo && isVideo.includes('video')) {
		const queue = GetQueue();
		const jobsToDelete = Object.keys(queue).filter(
			(key) =>
				queue[key].data.input_path == filePath &&
				queue[key].status.transcode_stage == TranscodeStage.Waiting
		);
		jobsToDelete.forEach((jobID) => {
			console.log(
				`[server] [watcher] Watcher for '${watcher.watch_path}' is requesting removal of job '${jobID}' because the input file '${filePath}' has been deleted.`
			);
			RemoveJob(jobID);
		});
	}
}

function onWatcherDetectFileChange(watcher: WatcherDefinitionType, filePath: string) {
	console.log(
		`[server] [watcher] Watcher for '${
			watcher.watch_path
		}' has detected a change in the file '${path.basename(filePath)}'.`
	);
}

export function UpdateWatchers() {
	const updatedWatchers = GetWatchersFromDatabase();
	EmitToAllClients('watchers-update', updatedWatchers);
}

export function AddWatcher(watcher: WatcherDefinitionType) {
	const result = InsertWatcherToDatabase(watcher);
	if (result) {
		RegisterWatcher(result.lastInsertRowid as number, { ...watcher, rules: [] });
		UpdateWatchers();
	}
}

export function RemoveWatcher(rowid: number) {
	const result = RemoveWatcherFromDatabase(rowid);
	if (result) {
		DeregisterWatcher(rowid);
		UpdateWatchers();
	}
}

export function AddWatcherRule(id: number, rule: WatcherRuleDefinitionType) {
	const result = InsertWatcherRuleToDatabase(id, rule);
	if (result) {
		UpdateWatchers();
	}
}

export function UpdateWatcherRule(id: number, rule: WatcherRuleDefinitionType) {
	const result = UpdateWatcherRuleInDatabase(id, rule);
	if (result) {
		UpdateWatchers();
	}
}

export function RemoveWatcherRule(id: number) {
	const result = RemoveWatcherRuleFromDatabase(id);
	if (result) {
		UpdateWatchers();
	}
}

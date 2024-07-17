import chokidar from 'chokidar';
import mime from 'mime';
import path from 'path';
import {
	GetWatchersFromDatabase,
	InsertWatcherToDatabase,
	RemoveWatcherFromDatabase,
} from './database/database-watcher';
import { Watcher, WatcherWithRowID } from 'types/watcher';
import { EmitToAllClients } from './connections';
import { AddJob, GetQueue, RemoveJob } from './queue';
import { Queue, QueueRequest } from 'types/queue';

const watchers: { [index: number]: chokidar.FSWatcher } = [];

export function RegisterWatcher(watcher: WatcherWithRowID) {
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

	watchers[watcher.rowid] = newWatcher;

	console.log(`[server] [watcher] Registered watcher for '${watcher.watch_path}'.`);
}

export async function DeregisterWatcher(rowid: number) {
	try {
		const directory = Object.entries(watchers[rowid].getWatched())[0].join('/');
		await watchers[rowid].close();
		console.log(`[server] [watcher] Deregistered watcher for '${directory}'.`);

		delete watchers[rowid];
	} catch (error) {
		console.error(
			`[server] [watcher] [error] Could not deregister watcher with rowid '${rowid}'.`
		);
		console.error(error);
	}
}

export function InitializeWatchers() {
	const watchers = GetWatchersFromDatabase();
	if (watchers) {
		watchers.forEach((watcher) => {
			RegisterWatcher(watcher);
		});
	}
}

function onWatcherDetectFileAdd(watcher: Watcher, filePath: string) {
	console.log(
		`[server] [watcher] Watcher for '${
			watcher.watch_path
		}' has detected the creation of the file '${path.basename(filePath)}'.`
	);

	const isVideo = mime.getType(filePath);
	if (isVideo && isVideo.includes('video')) {
		const parsedPath = path.parse(filePath);
		const newJobRequest: QueueRequest = {
			input: filePath,
			output: watcher.output_path
				? path.join(watcher.output_path, parsedPath.base)
				: path.join(parsedPath.dir, parsedPath.name + ` - (${watcher.preset_id})` + '.mkv'),
			preset: watcher.preset_id,
		};
		console.log(
			`[server] [watcher] Watcher for '${watcher.watch_path}' is requesting a new job be made for the video file '${parsedPath.base}'.`
		);
		AddJob(newJobRequest);
	}
}

function onWatcherDetectFileDelete(watcher: Watcher, filePath: string) {
	console.log(
		`[server] [watcher] Watcher for '${
			watcher.watch_path
		}' has detected the removal of the file/directory '${path.basename(filePath)}'.`
	);

	const isVideo = mime.getType(filePath);
	if (isVideo && isVideo.includes('video')) {
		const queue = GetQueue();
		const jobsToDelete = Object.keys(queue).filter((key) => queue[key].input == filePath);
		jobsToDelete.forEach((jobID) => {
			console.log(
				`[server] [watcher] Watcher for '${watcher.watch_path}' is requesting removal of job '${jobID}' because the input file '${filePath}' has been deleted.`
			);
			RemoveJob(jobID);
		});
	}
}

function onWatcherDetectFileChange(watcher: Watcher, filePath: string) {
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

export function AddWatcher(watcher: Watcher) {
	const result = InsertWatcherToDatabase(watcher);
	if (result) {
		RegisterWatcher({
			...watcher,
			rowid: result.lastInsertRowid as number,
		});
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

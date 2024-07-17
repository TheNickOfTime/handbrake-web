import path from 'path';
import chokidar from 'chokidar';
import {
	GetWatchersFromDatabase,
	InsertWatcherToDatabase,
	RemoveWatcherFromDatabase,
} from './database/database-watcher';
import { Watcher, WatcherWithRowID } from 'types/watcher';
import { EmitToAllClients } from './connections';

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
	// FOR TESTING!!!
	// if (GetWatchersFromDatabase() == null || GetWatchersFromDatabase()?.length == 0) {
	// 	InsertWatcherToDatabase({
	// 		watch_path: '/workspaces/handbrake-web/video/monitor',
	// 		preset_id: '2160p HDR -> 1080p HDR',
	// 	});
	// }

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
}

function onWatcherDetectFileDelete(watcher: Watcher, filePath: string) {
	console.log(
		`[server] [watcher] Watcher for '${
			watcher.watch_path
		}' has detected the removal of the file/directory '${path.basename(filePath)}'.`
	);
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

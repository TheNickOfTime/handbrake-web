import path from 'path';
import chokidar from 'chokidar';
import {
	GetWatchersFromDatabase,
	InsertWatcherToDatabase,
	RemoveWatcherFromDatabase,
} from './database/database-watcher';
import { Watcher } from 'types/watcher';
import { EmitToAllClients } from './connections';

export function RegisterWatchers() {
	// FOR TESTING!!!
	if (GetWatchersFromDatabase() == null || GetWatchersFromDatabase()?.length == 0) {
		InsertWatcherToDatabase({ watch_path: '/workspaces/handbrake-web/video/monitor' });
	}

	const watchers = GetWatchersFromDatabase();
	// console.log(watchers);
	if (watchers) {
		watchers.forEach((watcher) => {
			const newWatcher = chokidar.watch(watcher.watch_path, {
				ignoreInitial: true,
				awaitWriteFinish: true,
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

			console.log(`[server] [watcher] Registered watcher for '${watcher.watch_path}'.`);
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
	InsertWatcherToDatabase(watcher);
	UpdateWatchers();
}

export function RemoveWatcher(rowid: number) {
	console.log(`[server] [watcher] Removing watcher with rowid '${rowid}'.`);
	RemoveWatcherFromDatabase(rowid);
	UpdateWatchers();
}

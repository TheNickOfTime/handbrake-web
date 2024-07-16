import path from 'path';
import chokidar from 'chokidar';
import { GetWatchersFromDatabase, InsertWatcherToDatabase } from './database/database-watcher';
import { Watcher } from 'types/watcher';

export const watcherTableCreateStatement =
	'CREATE TABLE IF NOT EXISTS watchers(watch_path TEXT NOT NULL, output_path TEXT)';

export function RegisterWatchers() {
	if (GetWatchersFromDatabase() == null || GetWatchersFromDatabase()?.length == 0) {
		InsertWatcherToDatabase('/workspaces/handbrake-web/video/monitor');
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

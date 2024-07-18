import { database } from './database';
import { Watcher, WatcherWithRowID } from 'types/watcher';

export const watcherTableCreateStatement =
	'CREATE TABLE IF NOT EXISTS watchers(watch_path TEXT NOT NULL, output_path TEXT, preset_id TEXT NOT NULL)';

export function GetWatchersFromDatabase() {
	try {
		const watchersStatement = database.prepare<[], WatcherWithRowID>(
			'SELECT rowid, * FROM watchers'
		);
		const watchersQuery = watchersStatement.all();
		return watchersQuery;
	} catch (err) {
		console.error('[server] [database] [error] Could not get watchers from the database.');
		console.error(err);
	}
}

export function InsertWatcherToDatabase(watcher: Watcher) {
	try {
		const insertStatement = database.prepare<Watcher, Watcher>(
			'INSERT INTO watchers(watch_path, output_path, preset_id) VALUES($watch_path, $output_path, $preset_id)'
		);
		const insertResult = insertStatement.run({
			watch_path: watcher.watch_path,
			output_path: watcher.output_path,
			preset_id: watcher.preset_id,
		});
		return insertResult;
	} catch (err) {
		console.error(
			`[server] [database] [error] Could not add a watcher for '${watcher.watch_path}' to the database.`
		);
		console.error(err);
	}
}

export function RemoveWatcherFromDatabase(rowid: number) {
	try {
		const removeStatement = database.prepare('DELETE FROM watchers WHERE rowid = $rowid');
		const removalResult = removeStatement.run({ rowid: rowid });
		return removalResult;
	} catch (err) {
		console.error(
			`[server] [database] [error] Could not remove a watcher with the rowid '${rowid}' from the database.`
		);
		console.error(err);
	}
}

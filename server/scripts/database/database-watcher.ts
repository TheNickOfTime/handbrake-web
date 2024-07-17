import { database } from './database';
import { Watcher, WatcherWithRowID } from 'types/watcher';

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
			'INSERT INTO watchers(watch_path, output_path) VALUES($watch_path, $output_path)'
		);
		const insertResult = insertStatement.run(watcher);
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
		const removeStatement = database.prepare('DELETE FROM queue WHERE rowid = $rowid');
		const removalResult = removeStatement.run({ rowid: rowid });
	} catch (err) {
		console.error(
			`[server] [database] [error] Could not remove a watcher with the rowid '${rowid}' from the database.`
		);
		console.error(err);
	}
}

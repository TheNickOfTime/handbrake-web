import { database } from './database';
import { Watcher, Watchers, WatcherWithRowID } from 'types/watcher';

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

export function InsertWatcherToDatabase(watchPath: string, outputPath?: string) {
	try {
		const insertStatement = database.prepare<Watcher, Watcher>(
			'INSERT INTO watchers(watch_path, output_path) VALUES($watch_path, $output_path)'
		);
		const insertResult = insertStatement.run({
			watch_path: watchPath,
			output_path: outputPath,
		});
		return insertResult;
	} catch (err) {
		console.error(
			`[server] [database] [error] Could not add a watcher for '${watchPath}' to the database.`
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

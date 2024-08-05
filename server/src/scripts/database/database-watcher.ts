import { WatcherRuleTableType, WatcherTableType } from 'types/database';
import { database } from './database';
import {
	WatcherDefinitionType,
	WatcherDefinitionWithIDType,
	WatcherRuleDefinitionType,
} from 'types/watcher';

export const watcherTableCreateStatements = [
	'CREATE TABLE IF NOT EXISTS watchers( \
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
		watch_path TEXT NOT NULL, \
		output_path TEXT, \
		preset_id TEXT NOT NULL, \
		default_mask INTEGER NOT NULL \
	)',
	'CREATE TABLE IF NOT EXISTS watcher_rules( \
		watcher_id INT NOT NULL REFERENCES watcher_ids(id) ON DELETE CASCADE, \
		name TEXT NOT NULL, \
		mask INTEGER NOT NULL, \
		base_rule_method INTEGER NOT NULL, \
		rule_method INTEGER NOT NULL, \
		base_comparison_method INTEGER NOT NULL, \
		comparison_method INTEGER NOT NULL, \
		comparison TEXT NOT NULL \
	)',
];

export function GetWatchersFromDatabase() {
	try {
		const watchersStatement = database.prepare<[], WatcherDefinitionWithIDType>(
			'SELECT rowid, * FROM watchers'
		);
		const watchersQuery = watchersStatement.all();
		return watchersQuery;
	} catch (err) {
		console.error('[server] [database] [error] Could not get watchers from the database.');
		console.error(err);
	}
}

export function InsertWatcherToDatabase(watcher: WatcherDefinitionType) {
	try {
		const insertWatcherStatement = database.prepare<WatcherTableType>(
			'INSERT INTO watchers(watch_path, output_path, preset_id) VALUES($watch_path, $output_path, $preset_id)'
		);
		const insertWatcherResult = insertWatcherStatement.run({
			watch_path: watcher.watch_path,
			output_path: watcher.output_path ? watcher.output_path : null,
			preset_id: watcher.preset_id,
			default_mask: watcher.default_mask,
		});

		const insertRulesStatement = database.prepare<WatcherRuleDefinitionType>(
			'INSERT INTO watcher_rules(name, mask, base_rule_method, rule_method, base_comparison_method, comparison_method, comparison) VALUES($name, $mask, $base_rule_method, $rule_method, $base_comparison_method, $comparison_method, $comparison)'
		);

		watcher.rules.forEach((rule) => {
			insertRulesStatement.run(rule);
		});

		console.log(
			`[server] [database] Inserted 1 watcher with ${watcher.rules.length} rules into the databasse.`
		);

		return insertWatcherResult;
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

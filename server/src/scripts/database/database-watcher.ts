import { WatcherRuleTableType, WatcherTableType } from 'types/database';
import { database } from './database';
import {
	WatcherDefinitionType,
	WatcherRuleDefinitionType,
	WatcherDefinitionWithRulesType,
	WatcherDefinitionObjectType,
	WatcherRuleMaskMethods,
	WatcherRuleDefinitionObjectType,
} from 'types/watcher';
import { watch } from 'chokidar';

export const watcherTableCreateStatements = [
	'CREATE TABLE IF NOT EXISTS watchers( \
		watcher_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
		watch_path TEXT NOT NULL, \
		output_path TEXT, \
		preset_id TEXT NOT NULL, \
		default_mask INTEGER NOT NULL \
	)',
	'CREATE TABLE IF NOT EXISTS watcher_rules( \
		watcher_id INT NOT NULL REFERENCES watchers(watcher_id) ON DELETE CASCADE, \
		rule_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, \
		name TEXT NOT NULL, \
		mask INTEGER NOT NULL, \
		base_rule_method INTEGER NOT NULL, \
		rule_method INTEGER NOT NULL, \
		comparison_method INTEGER NOT NULL, \
		comparison TEXT NOT NULL \
	)',
];

export function GetWatchersFromDatabase() {
	try {
		const watchersStatement = database.prepare<[], WatcherTableType>('SELECT * FROM watchers');
		const watchersResult = watchersStatement.all();

		const ruleStatement = database.prepare<{ id: number }, WatcherRuleTableType>(
			'SELECT * FROM watcher_rules WHERE watcher_id = $id'
		);

		const rules = Object.fromEntries(
			watchersResult.map((watcher): [number, WatcherRuleDefinitionObjectType] => [
				watcher.watcher_id,
				Object.fromEntries(
					ruleStatement
						.all({ id: watcher.watcher_id })
						.map((rule): [number, WatcherRuleDefinitionType] => [
							rule.rule_id,
							{
								name: rule.name,
								mask: rule.mask,
								base_rule_method: rule.base_rule_method,
								rule_method: rule.rule_method,
								comparison_method: rule.comparison_method,
								comparison: rule.comparison,
							},
						])
				),
			])
		);

		const watchers: WatcherDefinitionObjectType = Object.fromEntries(
			watchersResult.map((watcher): [number, WatcherDefinitionWithRulesType] => [
				watcher.watcher_id,
				{
					watch_path: watcher.watch_path,
					output_path: watcher.output_path,
					preset_id: watcher.preset_id,
					default_mask: watcher.default_mask as WatcherRuleMaskMethods,
					rules: rules[watcher.watcher_id],
				},
			])
		);

		return watchers;
	} catch (err) {
		console.error('[server] [database] [error] Could not get watchers from the database.');
		console.error(err);
	}
}

export function GetWatcherWithIDFromDatabase(id: number) {
	try {
		const watcherStatement = database.prepare<{ id: number }, WatcherTableType>(
			'SELECT * FROM watchers WHERE watcher_id = $id'
		);
		const watcherResult = watcherStatement.get({ id: id });

		if (watcherResult) {
			const ruleStatement = database.prepare<{ id: number }, WatcherRuleTableType>(
				'SELECT * FROM watcher_rules WHERE watcher_id = $id'
			);

			const rulesResult = Object.fromEntries(
				ruleStatement.all({ id: id }).map((rule): [number, WatcherRuleDefinitionType] => [
					rule.rule_id,
					{
						name: rule.name,
						mask: rule.mask,
						base_rule_method: rule.base_rule_method,
						rule_method: rule.rule_method,
						comparison_method: rule.comparison_method,
						comparison: rule.comparison,
					},
				])
			);

			if (rulesResult) {
				const watchers: WatcherDefinitionWithRulesType = {
					watch_path: watcherResult.watch_path,
					output_path: watcherResult.output_path,
					preset_id: watcherResult.preset_id,
					default_mask: watcherResult.default_mask as WatcherRuleMaskMethods,
					rules: rulesResult,
				};

				return watchers;
			}
		}
	} catch (err) {
		console.error(
			`[server] [database] [error] Could not get watcher with id '${id}' from the database.`
		);
		console.error(err);
	}
}

export function GetWatcherIDFromRuleIDFromDatabase(id: number) {
	try {
		const idStatement = database.prepare<{ id: number }, { watcher_id: string }>(
			'SELECT watcher_id FROM watcher_rules WHERE rule_id = $id'
		);
		const idResult = idStatement.get({ id: id });
		if (idResult) {
			return parseInt(idResult.watcher_id);
		}
	} catch (err) {
		console.error(
			`[server] [database] [error] Could not get a wacther_id from a rule with '${id}' from the database.`
		);
		console.error(err);
	}
}

export function InsertWatcherToDatabase(watcher: WatcherDefinitionType) {
	try {
		const insertWatcherStatement = database.prepare<WatcherDefinitionType>(
			'INSERT INTO watchers(watch_path, output_path, preset_id, default_mask) VALUES($watch_path, $output_path, $preset_id, $default_mask)'
		);
		const insertWatcherResult = insertWatcherStatement.run({
			watch_path: watcher.watch_path,
			output_path: watcher.output_path,
			preset_id: watcher.preset_id,
			default_mask: watcher.default_mask,
		});

		console.log(
			`[server] [database] Inserted watcher for '${watcher.watch_path}' into the database.`
		);

		return insertWatcherResult;
	} catch (err) {
		console.error(
			`[server] [database] [error] Could not add a watcher for '${watcher.watch_path}' to the database.`
		);
		console.error(err);
	}
}

export function InsertWatcherRuleToDatabase(watcherID: number, rule: WatcherRuleDefinitionType) {
	try {
		const insertRuleStatement = database.prepare<WatcherRuleTableType>(
			'INSERT INTO watcher_rules(watcher_id, name, mask, base_rule_method, rule_method, comparison_method, comparison) VALUES($watcher_id, $name, $mask, $base_rule_method, $rule_method, $comparison_method, $comparison)'
		);
		const insertRuleResult = insertRuleStatement.run({
			watcher_id: watcherID,
			rule_id: 0,
			...rule,
		});
		console.log(
			`[server] [database] Inserted a new rule '${rule.name}' for watcher '${watcherID}' into the database with id '${insertRuleResult.lastInsertRowid}'.`
		);
		return insertRuleResult;
	} catch (err) {
		console.error(
			`[server] [database] Could not insert a new rule '${rule.name}' for watcher '${watcherID}' into the database.`
		);
		console.error(err);
	}
}

export function UpdateWatcherRuleInDatabase(ruleID: number, rule: WatcherRuleDefinitionType) {
	try {
		const updateStatement = database.prepare<{ id: number } & WatcherRuleDefinitionType>(
			'UPDATE watcher_rules SET \
			name = $name, \
			mask = $mask, \
			base_rule_method = $base_rule_method, \
			rule_method = $rule_method, \
			comparison_method = $comparison_method, \
			comparison = $comparison \
			WHERE rule_id = $id'
		);
		const updateResult = updateStatement.run({ id: ruleID, ...rule });
		console.log(
			`[server] [database] Updated rule '${rule.name}' with id '${ruleID}' in the database.`
		);
		return updateResult;
	} catch (err) {
		console.error(
			`[server] [database] Could not update rule '${rule.name}' with id '${ruleID}' in the database.`
		);
		console.error(err);
	}
}

export function RemoveWatcherFromDatabase(id: number) {
	try {
		const removeStatement = database.prepare('DELETE FROM watchers WHERE id = $id');
		const removalResult = removeStatement.run({ id: id });
		console.log(`[server] [database] Removed watcher with id '${id}' from the database.`);
		return removalResult;
	} catch (err) {
		console.error(
			`[server] [database] [error] Could not remove a watcher with the id '${id}' from the database.`
		);
		console.error(err);
	}
}

export function RemoveWatcherRuleFromDatabase(id: number) {
	try {
		const removeStatement = database.prepare('DELETE FROM watcher_rules WHERE rule_id = $id');
		const removalResult = removeStatement.run({ id: id });
		console.log(`[server] [database] Removed rule with id '${id}' from the database.`);
		return removalResult;
	} catch (err) {
		console.error(
			`[server] [database] [error] Could not remove a watcher rule with the id '${id}' from the database.`
		);
		console.error(err);
	}
}

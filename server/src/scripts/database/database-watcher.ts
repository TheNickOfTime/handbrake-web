import {
	type AddWatcherRuleType,
	type AddWatcherType,
	type DetailedWatcherType,
	type UpdateWatcherRuleType,
} from '@handbrake-web/shared/types/database';
import { jsonArrayFrom } from 'kysely/helpers/sqlite';
import logger from 'logging';
import { database } from './database';

const selectFromWatchersDetailed = database
	.selectFrom('watchers')
	.select((eb) => [
		'watchers.watcher_id',
		'watchers.watch_path',
		'watchers.output_path',
		'watchers.preset_category',
		'watchers.preset_id',
		'watchers.start_queue',
		'watchers.use_polling',
		jsonArrayFrom(
			eb
				.selectFrom('watcher_rules')
				.select([
					'watcher_rules.rule_id',
					'watcher_rules.name',
					'watcher_rules.mask',
					'watcher_rules.base_rule_method',
					'watcher_rules.rule_method',
					'watcher_rules.comparison_method',
					'watcher_rules.comparison',
				])
				.whereRef('watchers.watcher_id', '=', 'watcher_rules.watcher_id')
		).as('rules'),
	]);

export async function DatabaseGetDetailedWatchers() {
	try {
		const watchers: DetailedWatcherType[] = await selectFromWatchersDetailed.execute();
		return watchers;
	} catch (err) {
		logger.error('[server] [database] [error] Could not get watchers from the database.');
		throw err;
	}
}

export async function DatabaseGetDetailedWatcherByID(watcher_id: number) {
	try {
		const watcher: DetailedWatcherType = await selectFromWatchersDetailed
			.where('watcher_id', '=', watcher_id)
			.executeTakeFirstOrThrow();
		return watcher;
	} catch (err) {
		logger.error(
			`[server] [database] [error] Could not get watcher with id '${watcher_id}' from the database.`
		);
		throw err;
	}
}

export async function DatabaseGetWatcherIDFromRule(rule_id: number) {
	try {
		const result = await database
			.selectFrom('watcher_rules')
			.where('rule_id', '=', rule_id)
			.select('watcher_id')
			.executeTakeFirstOrThrow();

		return result.watcher_id;
	} catch (err) {
		logger.error(
			`[server] [database] [error] Could not get a wacther_id from a rule with '${rule_id}' from the database.`
		);
		throw err;
	}
}

export async function DatabaseInsertWatcher(watcher: AddWatcherType) {
	try {
		const result = await database
			.insertInto('watchers')
			.values(watcher)
			.returningAll()
			.executeTakeFirstOrThrow();

		logger.info(
			`[server] [database] Inserted watcher for '${watcher.watch_path}' into the database.`
		);

		return result;
	} catch (err) {
		logger.error(
			`[server] [database] [error] Could not add a watcher for '${watcher.watch_path}' to the database.`
		);
		throw err;
	}
}

export async function DatabaseInsertWatcherRule(watcher_id: number, values: AddWatcherRuleType) {
	try {
		const result = await database
			.insertInto('watcher_rules')
			.values({ watcher_id, ...values })
			.returningAll()
			.executeTakeFirstOrThrow();

		logger.info(
			`[server] [database] Inserted a new rule '${values.name}' for watcher '${watcher_id}' into the database with id '${result.rule_id}'.`
		);

		return result;
	} catch (err) {
		logger.error(
			`[server] [database] Could not insert a new rule '${values.name}' for watcher '${watcher_id}' into the database.`
		);
		throw err;
	}
}

export async function UpdateWatcherRuleInDatabase(rule_id: number, values: UpdateWatcherRuleType) {
	try {
		const result = database
			.updateTable('watcher_rules')
			.set(values)
			.where('rule_id', '=', rule_id)
			.executeTakeFirstOrThrow();

		logger.info(
			`[server] [database] Updated rule '${values.name}' with id '${rule_id}' in the database.`
		);

		return result;
	} catch (err) {
		logger.error(
			`[server] [database] Could not update rule '${values.name}' with id '${rule_id}' in the database.`
		);
		throw err;
	}
}

export async function RemoveWatcherFromDatabase(watcher_id: number) {
	try {
		const result = await database
			.deleteFrom('watchers')
			.where('watcher_id', '=', watcher_id)
			.executeTakeFirstOrThrow();

		logger.info(
			`[server] [database] Removed watcher with id '${watcher_id}' from the database.`
		);

		return result;
	} catch (err) {
		logger.error(
			`[server] [database] [error] Could not remove a watcher with the id '${watcher_id}' from the database.`
		);
		throw err;
	}
}

export async function RemoveWatcherRuleFromDatabase(rule_id: number) {
	try {
		const result = await database
			.deleteFrom('watcher_rules')
			.where('rule_id', '=', rule_id)
			.executeTakeFirstOrThrow();

		logger.info(`[server] [database] Removed rule with id '${rule_id}' from the database.`);

		return result;
	} catch (err) {
		logger.error(
			`[server] [database] [error] Could not remove a watcher rule with the id '${rule_id}' from the database.`
		);
		logger.error(err);
	}
}

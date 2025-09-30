import {
	type AddWatcher,
	type AddWatcherRule,
	type UpdateWatcherRule,
} from '@handbrake-web/shared/types/database';
import { jsonArrayFrom } from 'kysely/helpers/postgres';
import logger from 'logging';
import { database } from './database';

const selectFromWatchersDetailed = database
	.selectFrom('watchers')
	.select((eb) => [
		'watcher_id',
		'watch_path',
		'output_path',
		'preset_category',
		'preset_id',
		jsonArrayFrom(
			eb
				.selectFrom('watcher_rules')
				.whereRef('watcher_id', '=', 'watchers.watcher_id')
				.selectAll()
		).as('rules'),
	]);

export async function DatabaseGetDetailedWatchers() {
	try {
		const watchers = await selectFromWatchersDetailed.execute();
		return watchers;
	} catch (err) {
		logger.error('[server] [database] [error] Could not get watchers from the database.');
		throw err;
	}
}

export async function DatabaseGetDetailedWatcherByID(watcher_id: number) {
	try {
		const watcher = await selectFromWatchersDetailed
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

export async function DatabaseInsertWatcher(watcher: AddWatcher) {
	try {
		const result = await database
			.insertInto('watchers')
			.values(watcher)
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

export async function DatabaseInsertWatcherRule(watcher_id: number, values: AddWatcherRule) {
	try {
		const result = await database
			.insertInto('watcher_rules')
			.values({ watcher_id, ...values })
			.executeTakeFirstOrThrow();

		logger.info(
			`[server] [database] Inserted a new rule '${values.name}' for watcher '${watcher_id}' into the database with id '${result.insertId}'.`
		);

		return result;
	} catch (err) {
		logger.error(
			`[server] [database] Could not insert a new rule '${values.name}' for watcher '${watcher_id}' into the database.`
		);
		throw err;
	}
}

export async function UpdateWatcherRuleInDatabase(rule_id: number, values: UpdateWatcherRule) {
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

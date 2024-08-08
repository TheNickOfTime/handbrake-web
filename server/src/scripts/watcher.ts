import chokidar from 'chokidar';
import mime from 'mime';
import path from 'path';
import fs from 'fs/promises';
import {
	GetWatcherIDFromRuleIDFromDatabase,
	GetWatchersFromDatabase,
	GetWatcherWithIDFromDatabase,
	InsertWatcherRuleToDatabase,
	InsertWatcherToDatabase,
	RemoveWatcherFromDatabase,
	RemoveWatcherRuleFromDatabase,
	UpdateWatcherRuleInDatabase,
} from './database/database-watcher';
import {
	WatcherDefinitionType,
	WatcherDefinitionWithRulesType,
	WatcherRuleBaseMethods,
	WatcherRuleComparisonLookup,
	WatcherRuleComparisonMethods,
	WatcherRuleDefinitionType,
	WatcherRuleFileInfoMethods,
	WatcherRuleMaskMethods,
	WatcherRuleMediaInfoMethods,
	WatcherRuleNumberComparisonMethods,
	WatcherRuleStringComparisonMethods,
} from 'types/watcher';
import { EmitToAllClients } from './connections';
import { AddJob, GetQueue, RemoveJob } from './queue';
import { QueueRequestType } from 'types/queue';
import { CheckFilenameCollision } from './files';
import { TranscodeStage } from 'types/transcode';
import { ConvertBitsToKilobits, ConvertBytesToMegabytes, GetMediaInfo } from './media';

const watchers: { [index: number]: chokidar.FSWatcher } = [];

export function RegisterWatcher(id: number, watcher: WatcherDefinitionWithRulesType) {
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

	watchers[id] = newWatcher;

	console.log(`[server] [watcher] Registered watcher for '${watcher.watch_path}'.`);
}

export async function DeregisterWatcher(id: number) {
	try {
		// console.log(watchers);
		const directory = Object.entries(watchers[id].getWatched())[0].join('/');
		await watchers[id].close();
		console.log(`[server] [watcher] Deregistered watcher for '${directory}'.`);

		delete watchers[id];
	} catch (error) {
		console.error(`[server] [watcher] [error] Could not deregister watcher with id '${id}'.`);
		console.error(error);
	}
}

export function InitializeWatchers() {
	const watchers = GetWatchersFromDatabase();
	if (watchers) {
		Object.keys(watchers).forEach((watcherID) => {
			const parsedWatcherID = parseInt(watcherID);
			RegisterWatcher(parsedWatcherID, watchers[parsedWatcherID]);
		});
	}
}

function WatcherRuleStringComparison(
	input: string,
	method: WatcherRuleStringComparisonMethods,
	value: string
) {
	switch (method) {
		case WatcherRuleStringComparisonMethods.Contains:
			return input.includes(value);
		case WatcherRuleStringComparisonMethods.EqualTo:
			return input == value;
		case WatcherRuleStringComparisonMethods.RegularExpression:
			const splitRegex = value.match(
				/\/((?![*+?])(?:[^\r\n\[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+)\/((?:g(?:im?|mi?)?|i(?:gm?|mg?)?|m(?:gi?|ig?)?)?)/
			);
			if (splitRegex) {
				return input.match(new RegExp(splitRegex[1], splitRegex[2])) ? true : false;
			} else {
				console.log(
					`[server] [watcher] [error] Could not detect a valid regex in the string '${value}'.`
				);
				return false;
			}
	}
}

function WatcherRuleNumberComparison(
	input: string,
	method: WatcherRuleNumberComparisonMethods,
	value: string
) {
	const inputNumber = parseFloat(input);
	const valueNumber = parseFloat(value);

	switch (method) {
		case WatcherRuleNumberComparisonMethods.LessThan:
			return inputNumber < valueNumber;
		case WatcherRuleNumberComparisonMethods.LessThanOrEqualTo:
			return inputNumber <= valueNumber;
		case WatcherRuleNumberComparisonMethods.EqualTo:
			return inputNumber == valueNumber;
		case WatcherRuleNumberComparisonMethods.GreaterThan:
			return inputNumber > valueNumber;
		case WatcherRuleNumberComparisonMethods.GreaterThanOrEqualTo:
			return inputNumber >= valueNumber;
	}
}

async function onWatcherDetectFileAdd(watcher: WatcherDefinitionWithRulesType, filePath: string) {
	console.log(
		`[server] [watcher] Watcher for '${
			watcher.watch_path
		}' has detected the creation of the file '${path.basename(filePath)}'.`
	);

	const asyncEvery = async (
		values: WatcherRuleDefinitionType[],
		predicate: (value: WatcherRuleDefinitionType) => Promise<boolean>
	) => {
		for (let value of values) {
			const result = await predicate(value);
			if (!result) {
				return false;
			}
			return true;
		}
	};

	const isValid = await asyncEvery(Object.values(watcher.rules), async (rule) => {
		let comparisonMethod =
			WatcherRuleComparisonLookup[
				rule.base_rule_method == WatcherRuleBaseMethods.FileInfo
					? WatcherRuleFileInfoMethods[rule.rule_method]
					: rule.base_rule_method == WatcherRuleBaseMethods.MediaInfo
					? WatcherRuleMediaInfoMethods[rule.rule_method]
					: 0
			];
		let input = '';

		switch (rule.base_rule_method) {
			case WatcherRuleBaseMethods.FileInfo:
				switch (rule.rule_method as WatcherRuleFileInfoMethods) {
					case WatcherRuleFileInfoMethods.FileName:
						input = path.parse(filePath).name;
						break;
					case WatcherRuleFileInfoMethods.FileExtension:
						input = path.parse(filePath).ext;
						break;
					case WatcherRuleFileInfoMethods.FileSize:
						input = ConvertBytesToMegabytes((await fs.stat(filePath)).size).toFixed(1);
						break;
				}
				break;
			case WatcherRuleBaseMethods.MediaInfo:
				const mediaInfo = await GetMediaInfo(filePath);
				const videoStream = mediaInfo.streams.find(
					(stream) => stream.codec_type == 'video'
				);
				if (!videoStream) return false;

				switch (rule.rule_method) {
					case WatcherRuleMediaInfoMethods.MediaWidth:
						input = videoStream.width!.toString();
						break;
					case WatcherRuleMediaInfoMethods.MediaHeight:
						input = videoStream.height!.toString();
						break;
					case WatcherRuleMediaInfoMethods.MediaBitrate:
						input = ConvertBitsToKilobits(videoStream.bit_rate!).toFixed(0);
						break;
					case WatcherRuleMediaInfoMethods.MediaEncoder:
						input = videoStream.codec_long_name!.toString();
						break;
				}
				break;
		}

		let result =
			comparisonMethod == WatcherRuleComparisonMethods.String
				? WatcherRuleStringComparison(
						input,
						rule.comparison_method as WatcherRuleStringComparisonMethods,
						rule.comparison
				  )
				: comparisonMethod == WatcherRuleComparisonMethods.Number
				? WatcherRuleNumberComparison(
						input,
						rule.comparison_method as WatcherRuleNumberComparisonMethods,
						rule.comparison
				  )
				: false;

		if (rule.mask == WatcherRuleMaskMethods.Exclude) {
			result = !result;
		}

		return result;
	});

	if (!isValid) {
		console.log(
			`[server] [watcher] Watcher for '${watcher.watch_path}'s ${
				Object.keys(watcher.rules).length
			} rule conditions have not been met for file '${path.basename(filePath)}'`
		);
		return;
	}

	const isVideo = mime.getType(filePath);
	if (isVideo && isVideo.includes('video')) {
		const parsedPath = path.parse(filePath);
		const outputPathBase = watcher.output_path ? watcher.output_path : parsedPath.dir;
		const outputPathName = parsedPath.name;
		const outputPathExtension = '.mkv';
		const outputPathFull = path.join(outputPathBase, outputPathName) + outputPathExtension;
		const checkedOutputPath = (
			await CheckFilenameCollision(outputPathBase, [
				{
					path: outputPathFull,
					name: outputPathName,
					extension: outputPathExtension,
					isDirectory: false,
				},
			])
		)[0].path;
		const newJobRequest: QueueRequestType = {
			input: filePath,
			output: checkedOutputPath,
			preset: watcher.preset_id,
		};
		console.log(
			`[server] [watcher] Watcher for '${watcher.watch_path}' is requesting a new job be made for the video file '${parsedPath.base}'.`
		);
		// AddJob(newJobRequest);
	}
}

function onWatcherDetectFileDelete(watcher: WatcherDefinitionWithRulesType, filePath: string) {
	console.log(
		`[server] [watcher] Watcher for '${
			watcher.watch_path
		}' has detected the removal of the file/directory '${path.basename(filePath)}'.`
	);

	const isVideo = mime.getType(filePath);
	if (isVideo && isVideo.includes('video')) {
		const queue = GetQueue();
		const jobsToDelete = Object.keys(queue).filter(
			(key) =>
				queue[key].data.input_path == filePath &&
				queue[key].status.transcode_stage == TranscodeStage.Waiting
		);
		jobsToDelete.forEach((jobID) => {
			console.log(
				`[server] [watcher] Watcher for '${watcher.watch_path}' is requesting removal of job '${jobID}' because the input file '${filePath}' has been deleted.`
			);
			RemoveJob(jobID);
		});
	}
}

function onWatcherDetectFileChange(watcher: WatcherDefinitionWithRulesType, filePath: string) {
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

export function AddWatcher(watcher: WatcherDefinitionType) {
	const result = InsertWatcherToDatabase(watcher);
	if (result) {
		RegisterWatcher(result.lastInsertRowid as number, { ...watcher, rules: [] });
		UpdateWatchers();
	}
}

export function RemoveWatcher(watcherID: number) {
	const result = RemoveWatcherFromDatabase(watcherID);
	if (result) {
		DeregisterWatcher(watcherID);
		UpdateWatchers();
	}
}

export async function AddWatcherRule(watcherID: number, rule: WatcherRuleDefinitionType) {
	await DeregisterWatcher(watcherID);
	const result = InsertWatcherRuleToDatabase(watcherID, rule);
	if (result) {
		UpdateWatchers();
		const updatedWatcher = GetWatcherWithIDFromDatabase(watcherID);
		if (updatedWatcher) {
			RegisterWatcher(watcherID, updatedWatcher);
		}
	}
}

export async function UpdateWatcherRule(ruleID: number, rule: WatcherRuleDefinitionType) {
	const watcherID = GetWatcherIDFromRuleIDFromDatabase(ruleID);
	if (watcherID) {
		await DeregisterWatcher(watcherID);
		const result = UpdateWatcherRuleInDatabase(ruleID, rule);
		if (result) {
			UpdateWatchers();
			const updatedWatcher = GetWatcherWithIDFromDatabase(watcherID);
			if (updatedWatcher) {
				RegisterWatcher(watcherID, updatedWatcher);
			}
		}
	}
}

export async function RemoveWatcherRule(ruleID: number) {
	const watcherID = GetWatcherIDFromRuleIDFromDatabase(ruleID);
	if (watcherID) {
		await DeregisterWatcher(watcherID);
		const result = RemoveWatcherRuleFromDatabase(ruleID);
		if (result) {
			UpdateWatchers();
			const updatedWatcher = GetWatcherWithIDFromDatabase(watcherID);
			if (updatedWatcher) {
				RegisterWatcher(watcherID, updatedWatcher);
			}
		}
	}
}

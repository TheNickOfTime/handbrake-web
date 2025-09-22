import { access, mkdir, readdir, readFile, rm, writeFile } from 'fs/promises';
import { getPresetCount } from 'funcs/preset.funcs';
import logger from 'logging';
import path from 'path';
import { cwd } from 'process';
import {
	type HandbrakeDefaultPresetsType,
	type HandbrakePresetCategoryType,
	type HandbrakePresetListType,
	type HandbrakePresetType,
} from 'types/preset';
import { EmitToAllClients } from './connections';
import { dataPath } from './data';

const defaultPresetsPath = path.resolve(cwd(), 'template/default-presets.json');
export const presetsPath = path.join(dataPath, '/presets');

let presets: HandbrakePresetCategoryType = {};
let defaultPresets: HandbrakePresetCategoryType = {};

const presetFileToPresetObject = async (path: string) => {
	const presetData = await readFile(path, { encoding: 'utf-8' });
	const presetObject: HandbrakePresetType = JSON.parse(presetData);

	return presetObject;
};

const presetFilesToPresetObject = async (presetPath: string) => {
	const newObject: HandbrakePresetCategoryType = {
		uncategorized: {},
	};
	const files = await readdir(presetPath, {
		encoding: 'utf-8',
		withFileTypes: true,
	});

	for (let dir of files) {
		if (dir.isDirectory()) {
			newObject[dir.name] = {};
			const categoryPath = path.join(dir.parentPath, dir.name);
			const categoryFiles = await readdir(categoryPath, {
				encoding: 'utf-8',
				withFileTypes: true,
			});

			const presetFiles = categoryFiles.filter((file) => file.isFile);
			for (let preset of presetFiles) {
				const presetPath = path.join(preset.parentPath, preset.name);
				const presetData = await presetFileToPresetObject(presetPath);
				const presetName = presetData.PresetList[0].PresetName;
				newObject[dir.name][presetName] = presetData;
			}
		} else {
			const presetPath = path.join(dir.parentPath, dir.name);
			const presetData = await presetFileToPresetObject(presetPath);
			const presetName = presetData.PresetList[0].PresetName;
			newObject.uncategorized[presetName] = presetData;
		}
	}

	return newObject;
};

const defaultPresetsFileToPresetObject = async () => {
	const newObject: HandbrakePresetCategoryType = {};

	const defaultPresetsData: HandbrakeDefaultPresetsType = JSON.parse(
		await readFile(defaultPresetsPath, { encoding: 'utf-8' })
	);

	for (let category of defaultPresetsData.PresetList) {
		const categoryName = category.PresetName;
		newObject[categoryName] = {};

		for (let preset of category.ChildrenArray) {
			const presetName = preset.PresetName;
			if (
				categoryName == 'Hardware' &&
				!presetName.includes('QSV') &&
				!presetName.includes('NVENC')
			) {
				continue;
			}

			const presetData: HandbrakePresetType = {
				PresetList: [preset],
				VersionMajor: defaultPresetsData.VersionMajor,
				VersionMicro: defaultPresetsData.VersionMicro,
				VersionMinor: defaultPresetsData.VersionMinor,
			};
			newObject[categoryName][presetName] = presetData;
		}
	}

	return newObject;
};

export async function LoadDefaultPresets() {
	try {
		defaultPresets = await defaultPresetsFileToPresetObject();
		logger.info(
			`[server] [presets] Default presets have been loaded from '${defaultPresetsPath}'.`
		);
	} catch (error) {
		logger.info(
			`[server] [presets] [error] Could not load the default presets from '${defaultPresetsPath}'.`
		);
		console.error(error);
	}
}

export async function LoadPresets() {
	try {
		try {
			await access(presetsPath);
		} catch {
			logger.info(
				`[server] [presets] The directory for preset storage at the path '${presetsPath}' does not exist, making the directory.`
			);
			await mkdir(presetsPath);
		}

		// account for old presets
		try {
			const oldPresetsPath = path.join(dataPath, 'presets.json');

			await access(oldPresetsPath);

			logger.warn(
				`[presets] [migration] There are presets stored at the old presets path ${oldPresetsPath}.`
			);
			logger.info(
				`[presets] [migration] Migrating presets stored in 'presets.json' to individual files at '${
					presetsPath + '/*'
				}'.`
			);

			try {
				const oldPresets = JSON.parse(
					await readFile(oldPresetsPath, { encoding: 'utf-8' })
				) as HandbrakePresetListType;
				for (let preset of Object.values(oldPresets)) {
					const presetPath = path.join(
						presetsPath,
						preset.PresetList[0].PresetName + '.json'
					);
					const presetData = JSON.stringify(preset, null, 2);
					await writeFile(presetPath, presetData);
					logger.info(
						`[presets] [migration] Migrated preset '${preset.PresetList[0].PresetName}' from the old preset at '${oldPresetsPath}' file to '${presetPath}'.`
					);
				}
				logger.info(
					`[presets] [migration] ${
						Object.keys(oldPresets).length
					} presets where migrated.`
				);
				await rm(oldPresetsPath);
				logger.info(
					`[presets] [migration] Removed the old presets file '${oldPresetsPath}'.`
				);
			} catch (err) {
				logger.error(`[presets] Migration of old presets at '' has failed.`);
				console.error(err);
			}
		} catch {
			//Nothing happens if the accessing the file fails - that is a good thing.
		}

		presets = await presetFilesToPresetObject(presetsPath);
		logger.info(
			`[server] [presets] ${getPresetCount(
				presets
			)} presets have been loaded from '${presetsPath}'.`
		);
	} catch (error) {
		logger.error(
			`[server] [presets] [error] Presets could not be loaded from '${presetsPath}'.`
		);
		console.error(error);
	}
}

export async function WritePreset(fileName: string, category: string, preset: HandbrakePresetType) {
	try {
		const categoryPath = path.join(presetsPath, category);
		try {
			await access(categoryPath);
		} catch {
			await mkdir(categoryPath);
			logger.info(
				`[server] [presets] Creating directory for category '${category}' at '${categoryPath}'.`
			);
		}

		const presetPath = path.join(categoryPath, fileName + '.json');
		const presetData = JSON.stringify(preset, null, 2);
		await writeFile(presetPath, presetData);
		logger.info(`[server] [presets] Wrote preset '${fileName}' to '${presetPath}'.`);
	} catch (error) {
		logger.error(`[server] [presets] [error] Cannot write preset to file.`);
		console.error(error);
	}
}

export function GetPresetNames() {
	return Object.keys(presets);
}

export function GetPresets() {
	return presets;
}

export function GetPresetByName(category: string, preset: string) {
	return presets[category][preset];
}

export function GetDefaultPresets() {
	return defaultPresets;
}

export function GetDefaultPresetByName(category: string, preset: string) {
	return defaultPresets[category][preset];
}

export async function AddPreset(newPreset: HandbrakePresetType, category: string) {
	try {
		if (!presets[category]) {
			presets[category] = {};
		}

		const saveAs = newPreset.PresetList[0].PresetName;
		presets[category][saveAs] = newPreset;
		await WritePreset(saveAs, category, newPreset);

		logger.info(`[server] [presets] Adding preset '${newPreset.PresetList[0].PresetName}'.`);
		EmitToAllClients('presets-update', presets);
	} catch (error) {
		logger.error(
			`[server] [presets] [error] Could not add the preset '${newPreset.PresetList[0].PresetName}'.`
		);
		console.error(error);
	}
}

export async function RemovePreset(presetName: string, category: string) {
	try {
		const presetPath =
			category != 'uncategorized'
				? path.join(presetsPath, category, presetName + '.json')
				: path.join(presetsPath, presetName + '.json');

		await rm(presetPath);
		delete presets[category][presetName];

		logger.info(`[server] [presets] Preset '${presetName}' has been removed.`);
		EmitToAllClients('presets-update', presets);
	} catch (error) {
		logger.error(`[server] [presets] [error] Could not remove the preset '${presetName}'.`);
		console.error(error);
	}
}

export async function RenamePreset(oldName: string, newName: string, category: string) {
	try {
		presets[category][newName] = presets[category][oldName];
		presets[category][newName].PresetList[0].PresetName = newName;
		delete presets[category][oldName];

		const oldPath = path.join(
			presetsPath,
			category != 'uncategorized' ? category : '',
			oldName + '.json'
		);
		const newPath = path.join(
			presetsPath,
			category != 'uncategorized' ? category : '',
			newName + '.json'
		);
		await rm(oldPath);
		await writeFile(newPath, JSON.stringify(presets[category][newName], null, 2));

		logger.info(
			`[server] [presets] The preset '${oldName}' has been renamed to '${newName}' at the path '${newPath}'`
		);
		EmitToAllClients('presets-update', presets);
	} catch (error) {
		logger.error(
			`[server] [presets] [error] Could not rename the preset '${oldName}' to '${newName}'.`
		);
		console.error(error);
	}
}

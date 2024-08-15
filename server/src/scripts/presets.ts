import { access, mkdir, readdir, readFile, writeFile, rename, rm } from 'fs/promises';
import path from 'path';
import {
	HandbrakePresetType,
	HandbrakePresetCategoryType,
	HandbrakeDefaultPresetsType,
	HandbrakePresetListType,
} from 'types/preset';
import { getPresetCount } from 'funcs/preset.funcs';
import { EmitToAllClients } from './connections';
import { dataPath } from './data';
import { json } from 'express';

const defaultPresetsPath = path.resolve('src/template/default-presets.json');
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
			const categoryPath = path.join(dir.path, dir.name);
			const categoryFiles = await readdir(categoryPath, {
				encoding: 'utf-8',
				withFileTypes: true,
			});

			const presetFiles = categoryFiles.filter((file) => file.isFile);
			for (let preset of presetFiles) {
				const presetPath = path.join(preset.path, preset.name);
				const presetData = await presetFileToPresetObject(presetPath);
				newObject[dir.name][path.parse(preset.name).name] = presetData;
			}
		} else {
			const presetPath = path.join(dir.path, dir.name);
			const uncategorizedPreset = await presetFileToPresetObject(presetPath);
			newObject.uncategorized[dir.name] = uncategorizedPreset;
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
		console.log(
			`[server] [presets] Default presets have been loaded from '${defaultPresetsPath}'.`
		);
	} catch (error) {
		console.log(
			`[server] [presets] [error] Could not load the default presets from '${defaultPresetsPath}'.`
		);
	}
}

export async function LoadPresets() {
	try {
		try {
			await access(presetsPath);
		} catch {
			console.log(
				`[server] [presets] The directory for preset storage at the path '${presetsPath}' does not exist, making the directory.`
			);
			await mkdir(presetsPath);
		}

		presets = await presetFilesToPresetObject(presetsPath);
		console.log(
			`[server] [presets] ${getPresetCount(
				presets
			)} presets have been loaded from '${presetsPath}'.`
		);
	} catch (error) {
		console.error(
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
			console.log(
				`[server] [presets] Creating directory for category '${category}' at '${categoryPath}'.`
			);
		}

		const presetPath = path.join(categoryPath, fileName + '.json');
		const presetData = JSON.stringify(preset, null, 2);
		await writeFile(presetPath, presetData);
		console.log(`[server] [presets] Wrote preset '${fileName}' to '${presetPath}'.`);
	} catch (error) {
		console.error(`[server] [presets] [error] Cannot write preset to file.`);
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

		console.log(`[server] [presets] Adding preset '${newPreset.PresetList[0].PresetName}'.`);
		EmitToAllClients('presets-update', presets);
	} catch (error) {
		console.error(
			`[server] [presets] [error] Could not add the preset '${newPreset.PresetList[0].PresetName}'.`
		);
		console.error(error);
	}
}

export async function RemovePreset(presetName: string, category: string) {
	try {
		await rm(path.join(presetsPath, category, presetName + '.json'));

		delete presets[category][presetName];

		console.log(`[server] [presets] Preset '${presetName}' has been removed.`);
		EmitToAllClients('presets-update', presets);
	} catch (error) {
		console.error(`[server] [presets] [error] Could not remove the preset '${presetName}'.`);
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

		console.log(
			`[server] [presets] The preset '${oldName}' has been renamed to '${newName}' at the path '${newPath}'`
		);
		EmitToAllClients('presets-update', presets);
	} catch (error) {
		console.error(
			`[server] [presets] [error] Could not rename the preset '${oldName}' to '${newName}'.`
		);
		console.error(error);
	}
}

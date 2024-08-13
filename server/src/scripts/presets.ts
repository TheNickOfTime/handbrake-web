import { access, mkdir, readdir, readFile, writeFile, rename, rm } from 'fs/promises';
import path from 'path';
import { HandbrakePresetType, HandbrakePresetListType } from 'types/preset';
import { EmitToAllClients } from './connections';
import { WriteDataToFile, dataPath } from './data';

export const presetsPath = path.join(dataPath, '/presets');
let presets: HandbrakePresetListType = {};

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

		const presetFiles = await readdir(presetsPath, { encoding: 'utf-8', recursive: false });
		for (let presetFile of presetFiles) {
			const presetData = await readFile(path.join(presetsPath, presetFile), {
				encoding: 'utf-8',
			});
			const preset = JSON.parse(presetData) as HandbrakePresetType;
			const presetName = preset.PresetList[0].PresetName;
			presets[presetName] = preset;
		}
		console.log(
			`[server] [presets] ${presetFiles.length} presets have been loaded from '${presetsPath}'.`
		);
	} catch (error) {
		console.error(
			`[server] [presets] [error] Presets could not be loaded from '${presetsPath}'.`
		);
		console.error(error);
	}
}

export async function WritePreset(fileName: string, preset: HandbrakePresetType) {
	try {
		const presetPath = path.join(presetsPath, fileName + '.json');
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

export async function AddPreset(newPreset: HandbrakePresetType) {
	try {
		const saveAs = newPreset.PresetList[0].PresetName;
		presets[saveAs] = newPreset;
		await WritePreset(saveAs, newPreset);

		console.log(`[server] [presets] Adding preset '${newPreset.PresetList[0].PresetName}'.`);
		EmitToAllClients('presets-update', presets);
	} catch (error) {
		console.error(
			`[server] [presets] [error] Could not add the preset '${newPreset.PresetList[0].PresetName}'.`
		);
		console.error(error);
	}
}

export async function RemovePreset(presetName: string) {
	try {
		delete presets[presetName];
		await rm(path.join(presetsPath, presetName + '.json'));

		console.log(`[server] [presets] Preset '${presetName}' has been removed.`);
		EmitToAllClients('presets-update', presets);
	} catch (error) {
		console.error(`[server] [presets] [error] COuld not remove the preset '${presetName}'.`);
		console.error(error);
	}
}

export async function RenamePreset(oldName: string, newName: string) {
	try {
		presets[oldName].PresetList[0].PresetName = newName;
		const oldPath = path.join(presetsPath, oldName + '.json');
		const newPath = path.join(presetsPath, newName + '.json');
		await rename(oldPath, newPath);

		console.log(
			`[server] [presets] The preset '${oldName}' has been renamed to '${newName}' at the path '${newPath}'`
		);
		EmitToAllClients('presets-update', presets);
	} catch (error) {
		console.error(
			`[server] [presets] [error] Could not rename the preset '${oldName}' to '${newName}'.`
		);
	}
}

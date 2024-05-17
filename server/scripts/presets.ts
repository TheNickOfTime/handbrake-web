import fs from 'fs/promises';
import { HandbrakePreset, HandbrakePresetList } from '../../types/preset';
import { EmitToAllClients } from './connections';
import { ReadDataFromFile, WriteDataToFile } from './data';

export const presetsPath = './data/presets.json';

let presets: HandbrakePresetList = {};

export function GetPresetNames() {
	return Object.keys(presets);
}

export function GetPresets() {
	return presets;
}

export function SetPresets(newPresets: HandbrakePresetList) {
	presets = newPresets;
}

export function AddPreset(preset: HandbrakePreset) {
	const saveAs = preset.PresetList[0].PresetName;
	presets[saveAs] = preset;
	console.log(`[server] Adding preset '${preset.PresetList[0].PresetName}'.`);
	EmitToAllClients('presets-update', presets);
	WriteDataToFile(presetsPath, presets);
}

export function RemovePreset(presetName: string) {
	delete presets[presetName];
	console.log(`[server] Preset '${presetName}' has been removed.`);
	EmitToAllClients('presets-update', presets);
	WriteDataToFile(presetsPath, presets);
}

export function RenamePreset(oldName: string, newName: string) {
	presets[oldName].PresetList[0].PresetName = newName;
}

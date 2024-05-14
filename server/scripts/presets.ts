import fs from 'fs/promises';
import { HandbrakePreset } from '../../types/preset';
import { EmitToAllClients } from './connections';
import { ReadDataFromFile, WriteDataToFile } from './data';

export const presetsPath = './data/presets.json';

let presets: { [index: string]: HandbrakePreset } = {};

export function GetPresetNames() {
	return Object.keys(presets);
}

export function GetPresets() {
	return presets;
}

export function SetPresets(newPresets: { [index: string]: HandbrakePreset }) {
	presets = newPresets;
}

export function AddPreset(preset: HandbrakePreset) {
	const saveAs = preset.PresetList[0].PresetName;
	presets[saveAs] = preset;
	console.log(`[server] Adding preset '${preset.PresetList[0].PresetName}'.`);
	EmitToAllClients('presets-update', GetPresetNames());
	WriteDataToFile(presetsPath, presets);
}

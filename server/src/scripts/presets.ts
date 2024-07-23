import path from 'path';
import { HandbrakePresetType, HandbrakePresetListType } from 'types/preset';
import { EmitToAllClients } from './connections';
import { WriteDataToFile, dataPath } from './data';

export const presetsPath = path.join(dataPath, 'presets.json');
console.log(`[server] [presets] Presets path is '${presetsPath}'`);

let presets: HandbrakePresetListType = {};

export function GetPresetNames() {
	return Object.keys(presets);
}

export function GetPresets() {
	return presets;
}

export function SetPresets(newPresets: HandbrakePresetListType) {
	presets = newPresets;
}

export function AddPreset(preset: HandbrakePresetType) {
	const saveAs = preset.PresetList[0].PresetName;
	presets[saveAs] = preset;
	console.log(`[server] [presets] Adding preset '${preset.PresetList[0].PresetName}'.`);
	EmitToAllClients('presets-update', presets);
	WriteDataToFile(presetsPath, presets);
}

export function RemovePreset(presetName: string) {
	delete presets[presetName];
	console.log(`[server] [presets] Preset '${presetName}' has been removed.`);
	EmitToAllClients('presets-update', presets);
	WriteDataToFile(presetsPath, presets);
}

export function RenamePreset(oldName: string, newName: string) {
	presets[oldName].PresetList[0].PresetName = newName;
}

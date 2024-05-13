import fs from 'fs';
import { HandbrakePreset } from '../../types/preset';
import { EmitToAllClients } from './connections';

// const presetsPath = ;

const presets: { [index: string]: HandbrakePreset } = {};

export function LoadPresets() {}

export function GetPresetNames() {
	return Object.keys(presets);
}

export function GetPresets() {
	return presets;
}

export function AddPreset(preset: HandbrakePreset) {
	const saveAs = preset.PresetList[0].PresetName;
	presets[saveAs] = preset;
	console.log(`[server] Adding preset '${preset.PresetList[0].PresetName}'.`);
	EmitToAllClients('presets-update', GetPresetNames());
}

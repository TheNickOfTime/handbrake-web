import { HandbrakePresetCategoryType } from '../types/preset';

export const getPresetCount = (presets: HandbrakePresetCategoryType) => {
	return Object.keys(presets).reduce((result, current) => {
		return result + Object.keys(presets[current]).length;
	}, 0);
};

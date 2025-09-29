import type { HandbrakePresetCategoryType } from '../types/preset';

export const getPresetCount = (presets: HandbrakePresetCategoryType) => {
	return Object.entries(presets).reduce((result, current) => {
		return result + Object.entries(current).length;
	}, 0);
};

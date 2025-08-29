import { createContext } from 'react';
import { HandbrakePresetDataType, HandbrakePresetType } from '~types/preset';

interface PresetCardContextType {
	preset: HandbrakePresetDataType;
}

export const PresetCardContext = createContext<PresetCardContextType | null>(null);

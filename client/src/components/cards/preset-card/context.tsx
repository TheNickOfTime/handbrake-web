import { createContext } from 'react';
import { HandbrakePresetDataType } from '~types/preset';

interface PresetCardContextType {
	preset: HandbrakePresetDataType;
}

export const PresetCardContext = createContext<PresetCardContextType | null>(null);

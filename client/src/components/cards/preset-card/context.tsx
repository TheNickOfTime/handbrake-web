import { HandbrakePresetDataType } from '@handbrake-web/shared/types/preset';
import { createContext } from 'react';

interface PresetCardContextType {
	preset: HandbrakePresetDataType;
}

export const PresetCardContext = createContext<PresetCardContextType | null>(null);

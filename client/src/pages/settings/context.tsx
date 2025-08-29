import { createContext } from 'react';
import { ConfigType } from '~types/config';

interface SettingsContextType {
	currentConfig: ConfigType;
	setCurrentConfig: React.Dispatch<React.SetStateAction<ConfigType>>;
	setPathsValid: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SettingsContext = createContext<SettingsContextType | null>(null);

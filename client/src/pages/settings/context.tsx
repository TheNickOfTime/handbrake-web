import { ConfigType } from '@handbrake-web/shared/types/config';
import { createContext } from 'react';

interface SettingsContextType {
	currentConfig: ConfigType;
	setCurrentConfig: React.Dispatch<React.SetStateAction<ConfigType>>;
	setPathsValid: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SettingsContext = createContext<SettingsContextType | null>(null);

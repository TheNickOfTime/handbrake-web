import { createContext } from 'react';

export const FileBrowserContext = createContext<FileBrowserContextType>({
	basePath: '',
	basePathName: '',
});

export type FileBrowserContextType = {
	basePath: string;
	basePathName: string;
};

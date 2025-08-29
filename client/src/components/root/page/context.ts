import { createContext } from 'react';

export type PageContextType = {
	scrollY: number;
};

export const PageContext = createContext<PageContextType>({
	scrollY: 0,
});

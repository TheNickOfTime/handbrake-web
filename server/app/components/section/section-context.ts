import { createContext } from 'react';

export type SectionContextType = {
	scrollY: number;
};

export const SectionContext = createContext<SectionContextType>({
	scrollY: 0,
});

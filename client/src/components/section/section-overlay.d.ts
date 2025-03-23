import { PropsWithChildren } from 'react';
import './section-overlay.scss';
type Params = PropsWithChildren & {
    id: string;
};
export default function SectionOverlay({ children, id }: Params): import("react/jsx-runtime").JSX.Element;
export {};

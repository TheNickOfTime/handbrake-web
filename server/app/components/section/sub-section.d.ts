import { PropsWithChildren } from 'react';
import './sub-section.scss';
type Params = PropsWithChildren & {
    title?: string;
    id: string;
};
export default function SubSection({ children, title, id }: Params): import("react/jsx-runtime").JSX.Element;
export {};

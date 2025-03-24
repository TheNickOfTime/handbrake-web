import { PropsWithChildren } from 'react';
import './section.scss';
type Params = PropsWithChildren & {
    title: string;
    className?: string;
    id?: string;
};
export default function Section({ children, title, className, id }: Params): import("react/jsx-runtime").JSX.Element;
export {};

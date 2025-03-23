import { PropsWithChildren } from 'react';
import './text-info.scss';
type Params = {
    label: string;
    vertical?: boolean;
} & PropsWithChildren;
export default function TextInfo({ label, children, vertical }: Params): import("react/jsx-runtime").JSX.Element;
export {};

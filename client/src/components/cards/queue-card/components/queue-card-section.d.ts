import { PropsWithChildren } from 'react';
type Params = PropsWithChildren & {
    label: string;
    title?: string;
};
export default function QueueCardSection({ children, label, title }: Params): import("react/jsx-runtime").JSX.Element;
export {};

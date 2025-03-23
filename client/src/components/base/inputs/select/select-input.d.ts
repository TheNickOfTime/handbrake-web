import { PropsWithChildren } from 'react';
import './select-input.scss';
type Params = PropsWithChildren & {
    id: string;
    label?: string;
    value: any;
    setValue?: React.Dispatch<React.SetStateAction<any>>;
    onChange?: (value: string) => void;
};
export default function SelectInput({ id, label, value, setValue, onChange, children }: Params): import("react/jsx-runtime").JSX.Element;
export {};

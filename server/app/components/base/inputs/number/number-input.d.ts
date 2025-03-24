import React from 'react';
import './number-input.scss';
type Params = {
    id: string;
    label: string;
    value: number;
    setValue?: React.Dispatch<React.SetStateAction<number>>;
    onChange?: (value: number) => void;
    step?: number;
    min?: number;
    max?: number;
    disabled?: boolean;
};
export default function NumberInput({ id, label, value, setValue, onChange, step, min, max, disabled, }: Params): import("react/jsx-runtime").JSX.Element;
export {};

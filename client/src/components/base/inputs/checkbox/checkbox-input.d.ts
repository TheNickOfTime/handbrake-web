import './checkbox-input.scss';
type Params = {
    id: string;
    label?: string;
    value: boolean;
    setValue?: React.Dispatch<React.SetStateAction<boolean>>;
    onChange?: (value: boolean) => void;
};
export default function CheckboxInput({ id, label, value, setValue, onChange }: Params): import("react/jsx-runtime").JSX.Element;
export {};

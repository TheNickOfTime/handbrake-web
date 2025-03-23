import './text-input.scss';
type Params = {
    id: string;
    label?: string;
    value: string;
    setValue?: React.Dispatch<React.SetStateAction<string>>;
    onChange?: (value: string) => void;
    onSubmit?: (value: string) => void;
    disabled?: boolean;
};
export default function TextInput({ id, label, value, setValue, onChange, onSubmit, disabled, }: Params): import("react/jsx-runtime").JSX.Element;
export {};

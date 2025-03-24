import './toggle-input.scss';
type Params = {
    id: string;
    label?: string;
    value: boolean;
    setValue?: React.Dispatch<React.SetStateAction<boolean>>;
    onChange?: (value: boolean) => void;
    disabled?: boolean;
};
export default function ToggleInput({ id, label, value, setValue, onChange, disabled, }: Params): import("react/jsx-runtime").JSX.Element;
export {};

import './button-input.scss';
type Params = {
    label?: string;
    icon?: string;
    color?: string;
    title?: string;
    disabled?: boolean;
    onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};
export default function ButtonInput({ label, icon, color, title, disabled, onClick, }: Params): import("react/jsx-runtime").JSX.Element;
export {};

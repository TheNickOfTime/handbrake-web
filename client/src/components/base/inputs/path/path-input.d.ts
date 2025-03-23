import { FileBrowserMode } from 'types/file-browser';
import { DirectoryItemType } from 'types/directory';
import './path-input.scss';
type Params = {
    id: string;
    label: string;
    startPath: string;
    rootPath: string;
    mode: FileBrowserMode;
    allowClear?: boolean;
    allowCreate?: boolean;
    value: string;
    setValue?: (value: string) => void;
    onConfirm?: (item: DirectoryItemType) => void;
};
export default function PathInput({ id, label, startPath, rootPath, mode, allowClear, allowCreate, value, setValue, onConfirm, }: Params): import("react/jsx-runtime").JSX.Element;
export {};

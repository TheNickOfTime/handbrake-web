import { DirectoryItemType } from 'types/directory';
import { FileBrowserMode } from 'types/file-browser';
import './file-browser.scss';
type Params = {
    startPath: string;
    rootPath: string;
    mode: FileBrowserMode;
    allowCreate: boolean;
    onConfirm: (item: DirectoryItemType) => void;
};
export default function FileBrowser({ startPath, rootPath, mode, allowCreate, onConfirm }: Params): import("react/jsx-runtime").JSX.Element;
export {};

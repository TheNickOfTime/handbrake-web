import { FileBrowserMode } from 'types/file-browser';
import { DirectoryType, DirectoryItemType } from 'types/directory';
type Params = {
    mode: FileBrowserMode;
    rootPath: string;
    directory: DirectoryType | null;
    updateDirectory: (newPath: string) => void;
    selectedItem: DirectoryItemType | undefined;
    setSelectedItem: React.Dispatch<React.SetStateAction<DirectoryItemType | undefined>>;
};
export default function FileBrowserBody({ mode, rootPath, directory, updateDirectory, selectedItem, setSelectedItem, }: Params): import("react/jsx-runtime").JSX.Element;
export {};

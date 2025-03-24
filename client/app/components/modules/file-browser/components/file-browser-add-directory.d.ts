import { DirectoryItemsType } from 'types/directory';
type Params = {
    existingItems: DirectoryItemsType;
    onCancel: () => void;
    onSubmit: (directoryName: string) => void;
};
export default function AddDirectory({ existingItems, onCancel, onSubmit }: Params): import("react/jsx-runtime").JSX.Element;
export {};

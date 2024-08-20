import { HandbrakePresetCategoryType } from 'types/preset';
type Params = {
    label: string;
    presets: HandbrakePresetCategoryType;
    collapsed?: boolean;
    allowRename?: boolean;
    handleRenamePreset: (oldName: string, newName: string, category: string) => void;
    handleRemovePreset: (preset: string, category: string) => void;
};
export default function PresetsList({ label, presets, collapsed, allowRename, handleRenamePreset, handleRemovePreset, }: Params): import("react/jsx-runtime").JSX.Element | undefined;
export {};

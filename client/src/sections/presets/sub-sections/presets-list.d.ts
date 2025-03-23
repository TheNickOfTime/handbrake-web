import { HandbrakePresetCategoryType } from 'types/preset';
type Params = {
    label: string;
    presets: HandbrakePresetCategoryType;
    collapsed?: boolean;
    canModify?: boolean;
    handleRenamePreset: (oldName: string, newName: string, category: string) => void;
    handleRemovePreset: (preset: string, category: string) => void;
};
export default function PresetsList({ label, presets, collapsed, canModify, handleRenamePreset, handleRemovePreset, }: Params): import("react/jsx-runtime").JSX.Element | undefined;
export {};

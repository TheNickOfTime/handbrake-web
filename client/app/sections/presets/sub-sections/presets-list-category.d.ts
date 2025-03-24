import { HandbrakePresetListType } from 'types/preset';
type Params = {
    category: string;
    presets: HandbrakePresetListType;
    collapsed: boolean;
    canModify: boolean;
    handleRenamePreset: (oldName: string, newName: string, category: string) => void;
    handleRemovePreset: (preset: string, category: string) => void;
};
export default function PresetListCategory({ category, presets, collapsed, canModify, handleRenamePreset, handleRemovePreset, }: Params): import("react/jsx-runtime").JSX.Element;
export {};

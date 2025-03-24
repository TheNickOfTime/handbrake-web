import { HandbrakePresetType } from 'types/preset';
import './preset-card.scss';
type Params = {
    preset: HandbrakePresetType;
    category: string;
    canModify?: boolean;
    handleRenamePreset?: (oldName: string, newName: string, category: string) => void;
    handleRemovePreset: (preset: string, category: string) => void;
};
export default function PresetCard({ preset, category, canModify, handleRenamePreset, handleRemovePreset, }: Params): import("react/jsx-runtime").JSX.Element;
export {};

import Section from '~components/root/section';
import { getPresetCount } from '~funcs/preset.funcs';
import { HandbrakePresetCategoryType } from '~types/preset';
import PresetListCategory from './components/category';

type Params = {
	label: string;
	presets: HandbrakePresetCategoryType;
	collapsed?: boolean;
	canModify?: boolean;
	handleRenamePreset: (oldName: string, newName: string, category: string) => void;
	handleRemovePreset: (preset: string, category: string) => void;
};

export default function PresetsList({
	label,
	presets,
	collapsed = true,
	canModify = false,
	handleRenamePreset,
	handleRemovePreset,
}: Params) {
	if (getPresetCount(presets) == 0) return;

	return (
		<Section heading={label} id='list'>
			{Object.keys(presets)
				.sort((a, b) =>
					a.toLowerCase() > b.toLowerCase() || a == 'uncategorized' ? 1 : -1
				)
				.filter((categoryName) => Object.keys(presets[categoryName]).length != 0)
				.map((categoryName) => (
					<PresetListCategory
						category={categoryName}
						presets={presets[categoryName]}
						collapsed={collapsed}
						canModify={canModify}
						handleRenamePreset={handleRenamePreset}
						handleRemovePreset={handleRemovePreset}
						key={`preset-list-category-${categoryName}`}
					/>
				))}
		</Section>
	);
}

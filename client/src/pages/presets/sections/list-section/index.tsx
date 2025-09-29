import { getPresetCount } from '@handbrake-web/shared/funcs/preset.funcs';
import { HandbrakePresetCategoryType } from '@handbrake-web/shared/types/preset';
import Section from '~components/root/section';
import PresetCategory from './components/category';
import styles from './styles.module.scss';

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
		<Section className={styles['list-section']} heading={label}>
			{Object.keys(presets)
				.sort((a, b) =>
					a.toLowerCase() > b.toLowerCase() || a == 'uncategorized' ? 1 : -1
				)
				.filter((categoryName) => Object.keys(presets[categoryName]).length != 0)
				.map((categoryName) => (
					<PresetCategory
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

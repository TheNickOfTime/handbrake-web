import { useContext } from 'react';
import SelectInput from '~components/base/inputs/select';
import { FirstLetterUpperCase } from '~funcs/string.funcs';
import { PrimaryContext } from '~layouts/primary/context';
import { CreateJobContext } from '../../context';
import styles from '../../styles.module.scss';

export default function PresetSection() {
	const { config, presets, defaultPresets } = useContext(PrimaryContext)!;
	const {
		presetCategory,
		preset,
		isDefaultPreset,
		handlePresetCategoryChange,
		handlePresetChange,
	} = useContext(CreateJobContext)!;

	return (
		<fieldset className={styles['preset-section']}>
			<legend>Preset</legend>
			<SelectInput
				id='preset-category-select'
				label='Preset Category'
				value={presetCategory}
				onChange={handlePresetCategoryChange}
			>
				<option value=''>N/A</option>
				{Object.keys(presets)
					.filter((category) => Object.keys(presets[category]).length)
					.sort((a, b) =>
						a == 'uncategorized' || a.toLowerCase() > b.toLowerCase() ? 1 : -1
					)
					.map((category) => (
						<option value={category} key={`preset-category-${category}`}>
							{category == 'uncategorized'
								? FirstLetterUpperCase(category)
								: category}
						</option>
					))}
				{config.presets['show-default-presets'] &&
					Object.keys(defaultPresets).map((category) => (
						<option
							value={`Default: ${category}`}
							key={`default-preset-category-${category}`}
						>
							Default: {category}
						</option>
					))}
			</SelectInput>
			<SelectInput
				id='preset-select'
				label='Selected Preset: '
				value={preset}
				onChange={handlePresetChange}
			>
				<option value=''>N/A</option>
				{isDefaultPreset &&
					defaultPresets[presetCategory.replace(/^Default:\s/, '')] &&
					Object.keys(defaultPresets[presetCategory.replace(/^Default:\s/, '')]).map(
						(preset) => (
							<option value={preset} key={`preset-${preset}`}>
								{preset}
							</option>
						)
					)}
				{!isDefaultPreset &&
					presets[presetCategory] &&
					Object.keys(presets[presetCategory]).map((preset) => (
						<option value={preset} key={`preset-${preset}`}>
							{preset}
						</option>
					))}
			</SelectInput>
		</fieldset>
	);
}

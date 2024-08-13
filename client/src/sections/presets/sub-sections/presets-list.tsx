import { HandbrakePresetListType } from 'types/preset';
import SubSection from 'components/section/sub-section';
import PresetCard from 'components/cards/preset-card/preset-card';
import './presets-list.scss';

type Params = {
	presets: HandbrakePresetListType;
	handleRenamePreset: (oldName: string, newName: string) => void;
	handleRemovePreset: (preset: string) => void;
};

export default function PresetsList({ presets, handleRenamePreset, handleRemovePreset }: Params) {
	return (
		<SubSection title='List' id='list'>
			{Object.keys(presets)
				.sort((a, b) => (a.toLowerCase() > b.toLowerCase() ? 1 : -1))
				.map((key) => {
					const preset = presets[key];
					return (
						<PresetCard
							preset={preset}
							handleRenamePreset={handleRenamePreset}
							handleRemovePreset={handleRemovePreset}
							key={key}
						/>
					);
				})}
		</SubSection>
	);
}

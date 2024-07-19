import { HandbrakePresetListType } from 'types/preset.types';
import SubSection from 'components/section/sub-section';
import PresetCard from 'components/cards/preset-card/preset-card';
import './presets-list.scss';

type Params = {
	presets: HandbrakePresetListType;
	handleRemovePreset: (preset: string) => void;
};

export default function PresetsList({ presets, handleRemovePreset }: Params) {
	return (
		<SubSection title='List' id='list'>
			{Object.keys(presets).map((key) => {
				const presetData = presets[key].PresetList[0];
				return (
					<PresetCard
						preset={presetData}
						handleRemovePreset={handleRemovePreset}
						key={key}
					/>
				);
			})}
		</SubSection>
	);
}

import { HandbrakePresetList } from 'types/preset';
import SubSection from 'components/section/sub-section';
import PresetCard from 'components/cards/preset-card/preset-card';
import './presets-list.scss';

type Params = {
	presets: HandbrakePresetList;
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

import { HandbrakePresetListType } from 'types/preset';
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
				const preset = presets[key];
				return (
					<PresetCard preset={preset} handleRemovePreset={handleRemovePreset} key={key} />
				);
			})}
		</SubSection>
	);
}

import { HandbrakePresetList } from '../../../../../types/preset';
import ButtonInput from '../../../components/base/inputs/button/button-input';
import SubSection from '../../../components/section/sub-section';
import './presets-buttons.scss';

type Params = {
	presets: HandbrakePresetList;
	handleOpenUploadPreset: () => void;
};

export default function PresetsButtons({ presets, handleOpenUploadPreset }: Params) {
	return (
		<SubSection id='buttons'>
			<div className='preset-count'>Presets: {Object.keys(presets).length}</div>
			<ButtonInput
				label='Upload New Preset'
				icon='bi-plus-lg'
				color='blue'
				onClick={handleOpenUploadPreset}
			/>
		</SubSection>
	);
}

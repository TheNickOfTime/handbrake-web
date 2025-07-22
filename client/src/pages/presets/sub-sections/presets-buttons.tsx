import { HandbrakePresetCategoryType } from 'types/preset';
import ButtonInput from 'components/base/inputs/button/button-input';
import SubSection from 'components/section/sub-section';

type Params = {
	presets: HandbrakePresetCategoryType;
	handleOpenUploadPreset: () => void;
};

export default function PresetsButtons({ presets, handleOpenUploadPreset }: Params) {
	return (
		<SubSection id='buttons'>
			<div className='preset-count'>
				Presets:{' '}
				{Object.keys(presets).reduce((prev, cur) => {
					return prev + Object.keys(presets[cur]).length;
				}, 0)}
			</div>
			<ButtonInput
				label='Upload New Preset'
				icon='bi-plus-lg'
				color='blue'
				onClick={handleOpenUploadPreset}
			/>
		</SubSection>
	);
}

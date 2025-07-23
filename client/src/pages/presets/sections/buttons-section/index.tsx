import ButtonInput from '~components/base/inputs/button';
import Section from '~components/root/section';
import { HandbrakePresetCategoryType } from '~types/preset';
import styles from './styles.module.scss';

type Params = {
	presets: HandbrakePresetCategoryType;
	handleOpenUploadPreset: () => void;
};

export default function PresetsButtons({ presets, handleOpenUploadPreset }: Params) {
	return (
		<Section id={styles['buttons']}>
			<div className={styles['preset-count']}>
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
		</Section>
	);
}

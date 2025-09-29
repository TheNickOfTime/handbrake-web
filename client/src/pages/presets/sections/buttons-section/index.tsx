import { HandbrakePresetCategoryType } from '@handbrake-web/shared/types/preset';
import AddIcon from '@icons/plus-lg.svg?react';
import ButtonInput from '~components/base/inputs/button';
import Section from '~components/root/section';
import styles from './styles.module.scss';

type Params = {
	presets: HandbrakePresetCategoryType;
	handleOpenUploadPreset: () => void;
};

export default function PresetsButtons({ presets, handleOpenUploadPreset }: Params) {
	return (
		<Section className={styles['button-section']}>
			<div className={styles['preset-count']}>
				Presets:{' '}
				{Object.keys(presets).reduce((prev, cur) => {
					return prev + Object.keys(presets[cur]).length;
				}, 0)}
			</div>
			<ButtonInput
				label='Upload New Preset'
				Icon={AddIcon}
				color='blue'
				onClick={handleOpenUploadPreset}
			/>
		</Section>
	);
}

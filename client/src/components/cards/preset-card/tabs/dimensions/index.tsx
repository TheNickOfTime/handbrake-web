import { PresetPropertiesDict } from '@handbrake-web/shared/dict/presets.dict';
import { BooleanToConfirmation } from '@handbrake-web/shared/funcs/string.funcs';
import { PictureCropMode } from '@handbrake-web/shared/types/preset';
import { useContext } from 'react';
import TextInfo from '~components/base/info/text-info';
import PresetTab from '../../components/preset-tab';
import PresetTabSection from '../../components/preset-tab-section';
import { PresetCardContext } from '../../context';
import styles from './styles.module.scss';

export default function DimensionsTab() {
	const { preset } = useContext(PresetCardContext)!;

	const rotationMatch = preset.PictureRotate ? preset.PictureRotate.match(/(\d+):([01])/) : null;

	return (
		<PresetTab className={styles['dimensions-tab']}>
			<PresetTabSection label='Orientation and Cropping'>
				<TextInfo label='Flip Horizontal'>
					{rotationMatch && BooleanToConfirmation(rotationMatch[2] != null)}
				</TextInfo>
				<TextInfo label='Rotation'>
					{rotationMatch && rotationMatch[1] ? rotationMatch[1] : 'N/A'}
				</TextInfo>
				<TextInfo label='Cropping'>{PictureCropMode[preset.PictureCropMode]}</TextInfo>
				<div className={styles['cropping-values']}>
					<TextInfo label='Top'>{preset.PictureTopCrop}px</TextInfo>
					<TextInfo label='Bottom'>{preset.PictureBottomCrop}px</TextInfo>
					<TextInfo label='Left'>{preset.PictureLeftCrop}px</TextInfo>
					<TextInfo label='Right'>{preset.PictureRightCrop}px</TextInfo>
				</div>
			</PresetTabSection>
			<PresetTabSection label='Resolution and Scaling'>
				<TextInfo label='Resolution Limit'>
					{preset.PictureWidth}x{preset.PictureHeight}
				</TextInfo>
				<TextInfo label='Anamorphic'>{PresetPropertiesDict[preset.PicturePAR]}</TextInfo>
				<TextInfo label='Pixel Aspect'>
					{preset.PicturePARWidth}x{preset.PicturePARHeight}
				</TextInfo>
				<TextInfo label='Optimal Size'>
					{BooleanToConfirmation(preset.PictureUseMaximumSize)}
				</TextInfo>
				<TextInfo label='Allow Upscaling'>
					{BooleanToConfirmation(preset.PictureAllowUpscaling)}
				</TextInfo>
			</PresetTabSection>
			<PresetTabSection label='Borders'>
				<TextInfo label='Fill'>{PresetPropertiesDict[preset.PicturePadMode]}</TextInfo>
				<TextInfo label='Color'>
					{preset.PicturePadColor
						? !preset.PicturePadColor.match(/^\d/)
							? preset.PicturePadColor.charAt(0).toUpperCase() +
							  preset.PicturePadColor.slice(1)
							: preset.PicturePadColor
						: 'N/A'}
				</TextInfo>
				<div className={styles['padding-values']}>
					<TextInfo label='Top'>{preset.PicturePadTop}px</TextInfo>
					<TextInfo label='Bottom'>{preset.PicturePadBottom}px</TextInfo>
					<TextInfo label='Left'>{preset.PicturePadLeft}px</TextInfo>
					<TextInfo label='Right'>{preset.PicturePadRight}px</TextInfo>
				</div>
			</PresetTabSection>
		</PresetTab>
	);
}

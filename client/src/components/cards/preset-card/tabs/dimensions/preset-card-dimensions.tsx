import { PresetPropertiesDict } from 'dict/presets.dict';
import { HandbrakePresetDataType, PictureCropMode } from 'types/preset';
import TextInfo from 'components/base/info/text-info/text-info';
import './preset-card-dimensions.scss';
import { BooleanToConfirmation } from 'funcs/string.funcs';

type Params = {
	preset: HandbrakePresetDataType;
};

export default function PresetCardDimensions({ preset }: Params) {
	const rotationMatch = preset.PictureRotate ? preset.PictureRotate.match(/(\d+):([01])/) : null;

	return (
		<div className='preset-card-section' id='dimensions'>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Orientation and Cropping</div>
				<TextInfo label='Flip Horizontal'>
					{rotationMatch && BooleanToConfirmation(rotationMatch[2] != null)}
				</TextInfo>
				<TextInfo label='Rotation'>
					{rotationMatch && rotationMatch[1] ? rotationMatch[1] : 'N/A'}
				</TextInfo>
				<TextInfo label='Cropping'>{PictureCropMode[preset.PictureCropMode]}</TextInfo>
				<div className='cropping-values'>
					<TextInfo label='Top'>{preset.PictureTopCrop}px</TextInfo>
					<TextInfo label='Bottom'>{preset.PictureBottomCrop}px</TextInfo>
					<TextInfo label='Left'>{preset.PictureLeftCrop}px</TextInfo>
					<TextInfo label='Right'>{preset.PictureRightCrop}px</TextInfo>
				</div>
			</div>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Resolution and Scaling</div>
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
			</div>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Borders</div>
				<TextInfo label='Fill'>{PresetPropertiesDict[preset.PicturePadMode]}</TextInfo>
				<TextInfo label='Color'>
					{preset.PicturePadColor
						? !preset.PicturePadColor.match(/^\d/)
							? preset.PicturePadColor.charAt(0).toUpperCase() +
							  preset.PicturePadColor.slice(1)
							: preset.PicturePadColor
						: 'N/A'}
				</TextInfo>
				<div className='padding-values'>
					<TextInfo label='Top'>{preset.PicturePadTop}px</TextInfo>
					<TextInfo label='Bottom'>{preset.PicturePadBottom}px</TextInfo>
					<TextInfo label='Left'>{preset.PicturePadLeft}px</TextInfo>
					<TextInfo label='Right'>{preset.PicturePadRight}px</TextInfo>
				</div>
			</div>
		</div>
	);
}

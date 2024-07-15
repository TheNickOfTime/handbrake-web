import TextInfo from 'components/base/info/text-info/text-info';
import { HandbrakePresetData, PictureCropMode } from 'types/preset';
import './preset-card-dimensions.scss';

type Params = {
	preset: HandbrakePresetData;
};

export default function PresetCardDimensions({ preset }: Params) {
	const rotationMatch = preset.PictureRotate ? preset.PictureRotate.match(/(\d+):([01])/) : null;

	return (
		<div className='preset-card-section' id='dimensions'>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Orientation and Cropping</div>
				<TextInfo label='Flip Horizontal'>
					{rotationMatch && rotationMatch[2] ? 'Yes' : 'No'}
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
				<TextInfo label='Anamorphic'>{preset.PicturePAR}</TextInfo>
				<TextInfo label='Pixel Aspect'>
					{preset.PicturePARWidth}x{preset.PicturePARHeight}
				</TextInfo>
				<TextInfo label='Optimal Size'>
					{preset.PictureUseMaximumSize ? 'Yes' : 'No'}
				</TextInfo>
				<TextInfo label='Allow Upscaling'>
					{preset.PictureAllowUpscaling ? 'Yes' : 'No'}
				</TextInfo>
			</div>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Borders</div>
				<TextInfo label='Fill'>{preset.PicturePadMode}</TextInfo>
				<TextInfo label='Color'>
					{preset.PicturePadColor ? preset.PicturePadColor : 'N/A'}
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

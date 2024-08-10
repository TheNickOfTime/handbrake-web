import { PresetPropertiesDict } from 'dict/presets.dict';
import { HandbrakePresetDataType } from 'types/preset';
import TextInfo from 'components/base/info/text-info/text-info';
import './preset-card-filters.scss';

type Params = {
	preset: HandbrakePresetDataType;
};

export default function PresetCardFilters({ preset }: Params) {
	return (
		<div className='preset-card-section' id='filters'>
			<div className='preset-card-subsection'>
				<TextInfo label='Detelecine'>
					{PresetPropertiesDict[preset.PictureDetelecine] || preset.PictureDetelecine}
					{preset.PictureDetelecine == 'custom' &&
						` - '${preset.PictureDetelecineCustom}'`}
				</TextInfo>

				<TextInfo label='Interlace Detection'>
					{PresetPropertiesDict[preset.PictureCombDetectPreset] ||
						preset.PictureCombDetectPreset}
					{preset.PictureCombDetectPreset == 'custom' &&
						` - '${preset.PictureCombDetectCustom}'`}
				</TextInfo>

				<TextInfo label='Deinterlace'>
					{PresetPropertiesDict[preset.PictureDeinterlaceFilter] ||
						preset.PictureDeinterlaceFilter}
					{preset.PictureDeinterlaceFilter != 'off' &&
						preset.PictureDeinterlacePreset != 'custom' &&
						`, Preset - ${
							PresetPropertiesDict[preset.PictureDeinterlacePreset] ||
							preset.PictureDeinterlacePreset
						}`}
					{preset.PictureDeinterlacePreset == 'custom' &&
						`, Custom - '${preset.PictureDeinterlaceCustom}'`}
				</TextInfo>

				<TextInfo label='Denoise'>
					{PresetPropertiesDict[preset.PictureDenoiseFilter] ||
						preset.PictureDenoiseFilter}
					{preset.PictureDenoiseFilter != 'off' &&
						preset.PictureDenoisePreset != 'custom' &&
						`, Preset - ${
							PresetPropertiesDict[preset.PictureDenoisePreset] ||
							preset.PictureDenoisePreset
						}`}
					{preset.PictureDenoisePreset == 'custom' &&
						`, Custom - '${preset.PictureDenoiseCustom}'`}
				</TextInfo>

				<TextInfo label='Chroma Smooth'>
					{PresetPropertiesDict[preset.PictureChromaSmoothPreset] ||
						preset.PictureChromaSmoothPreset}
					{preset.PictureChromaSmoothPreset != 'off' &&
						preset.PictureChromaSmoothPreset != 'custom' &&
						`, Tune - ${
							PresetPropertiesDict[preset.PictureChromaSmoothTune] ||
							preset.PictureChromaSmoothTune
						}`}
					{preset.PictureChromaSmoothPreset == 'custom' &&
						` - '${preset.PictureChromaSmoothCustom}'`}
				</TextInfo>

				<TextInfo label='Sharpen'>
					{PresetPropertiesDict[preset.PictureSharpenFilter] ||
						preset.PictureSharpenFilter}
					{preset.PictureSharpenFilter != 'off' &&
						preset.PictureSharpenPreset != 'custom' &&
						`, Preset - ${
							PresetPropertiesDict[preset.PictureSharpenPreset] ||
							preset.PictureSharpenPreset
						}`}
					{preset.PictureSharpenPreset == 'custom' &&
						`, Custom - '${preset.PictureSharpenCustom}'`}
				</TextInfo>

				<TextInfo label='Deblock'>
					{PresetPropertiesDict[preset.PictureDeblockPreset] ||
						preset.PictureDeblockPreset}
					{preset.PictureDeblockPreset != 'off' &&
						preset.PictureDeblockPreset != 'custom' &&
						`, Tune - ${
							PresetPropertiesDict[preset.PictureDeblockTune] ||
							preset.PictureDeblockTune
						}`}
					{preset.PictureDeblockPreset == 'custom' &&
						` - '${preset.PictureDeblockCustom}'`}
				</TextInfo>

				<TextInfo label='Colorspace'>
					{PresetPropertiesDict[preset.PictureColorspacePreset] ||
						preset.PictureColorspacePreset}
					{preset.PictureColorspacePreset == 'custom' &&
						` - '${preset.PictureColorspaceCustom}'`}
				</TextInfo>

				<TextInfo label='Grayscale'>{preset.VideoGrayScale ? 'Yes' : 'No'}</TextInfo>
			</div>
		</div>
	);
}

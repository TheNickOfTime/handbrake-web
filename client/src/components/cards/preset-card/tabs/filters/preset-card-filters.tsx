import { FilterLookup, HandbrakePresetData } from 'types/preset';
import './preset-card-filters.scss';
import TextInfo from 'components/base/info/text-info/text-info';

type Params = {
	preset: HandbrakePresetData;
};

export default function PresetCardFilters({ preset }: Params) {
	return (
		<div className='preset-card-section' id='filters'>
			<div className='preset-card-subsection'>
				<TextInfo label='Detelecine'>
					{FilterLookup[preset.PictureDetelecine] || preset.PictureDetelecine}
					{preset.PictureDetelecine == 'custom' &&
						` - '${preset.PictureDetelecineCustom}'`}
				</TextInfo>

				<TextInfo label='Interlace Detection'>
					{FilterLookup[preset.PictureCombDetectPreset] || preset.PictureCombDetectPreset}
					{preset.PictureCombDetectPreset == 'custom' &&
						` - '${preset.PictureCombDetectCustom}'`}
				</TextInfo>

				<TextInfo label='Deinterlace'>
					{FilterLookup[preset.PictureDeinterlaceFilter] ||
						preset.PictureDeinterlaceFilter}
					{preset.PictureDeinterlaceFilter != 'off' &&
						preset.PictureDeinterlacePreset != 'custom' &&
						`, Preset - ${
							FilterLookup[preset.PictureDeinterlacePreset] ||
							preset.PictureDeinterlacePreset
						}`}
					{preset.PictureDeinterlacePreset == 'custom' &&
						`, Custom - '${preset.PictureDeinterlaceCustom}'`}
				</TextInfo>

				<TextInfo label='Denoise'>
					{FilterLookup[preset.PictureDenoiseFilter] || preset.PictureDenoiseFilter}
					{preset.PictureDenoiseFilter != 'off' &&
						preset.PictureDenoisePreset != 'custom' &&
						`, Preset - ${
							FilterLookup[preset.PictureDenoisePreset] || preset.PictureDenoisePreset
						}`}
					{preset.PictureDenoisePreset == 'custom' &&
						`, Custom - '${preset.PictureDenoiseCustom}'`}
				</TextInfo>

				<TextInfo label='Chroma Smooth'>
					{FilterLookup[preset.PictureChromaSmoothPreset] ||
						preset.PictureChromaSmoothPreset}
					{preset.PictureChromaSmoothPreset != 'off' &&
						preset.PictureChromaSmoothPreset != 'custom' &&
						`, Tune - ${
							FilterLookup[preset.PictureChromaSmoothTune] ||
							preset.PictureChromaSmoothTune
						}`}
					{preset.PictureChromaSmoothPreset == 'custom' &&
						` - '${preset.PictureChromaSmoothCustom}'`}
				</TextInfo>

				<TextInfo label='Sharpen'>
					{FilterLookup[preset.PictureSharpenFilter] || preset.PictureSharpenFilter}
					{preset.PictureSharpenFilter != 'off' &&
						preset.PictureSharpenPreset != 'custom' &&
						`, Preset - ${
							FilterLookup[preset.PictureSharpenPreset] || preset.PictureSharpenPreset
						}`}
					{preset.PictureSharpenPreset == 'custom' &&
						`, Custom - '${preset.PictureSharpenCustom}'`}
				</TextInfo>

				<TextInfo label='Deblock'>
					{FilterLookup[preset.PictureDeblockPreset] || preset.PictureDeblockPreset}
					{preset.PictureDeblockPreset != 'off' &&
						preset.PictureDeblockPreset != 'custom' &&
						`, Tune - ${
							FilterLookup[preset.PictureDeblockTune] || preset.PictureDeblockTune
						}`}
					{preset.PictureDeblockPreset == 'custom' &&
						` - '${preset.PictureDeblockCustom}'`}
				</TextInfo>

				<TextInfo label='Colorspace'>
					{FilterLookup[preset.PictureColorspacePreset] || preset.PictureColorspacePreset}
					{preset.PictureColorspacePreset == 'custom' &&
						` - '${preset.PictureColorspaceCustom}'`}
				</TextInfo>

				<TextInfo label='Grayscale'>{preset.VideoGrayScale ? 'Yes' : 'No'}</TextInfo>
			</div>
		</div>
	);
}

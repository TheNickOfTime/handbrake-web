import TextInfo from 'components/base/info/text-info/text-info';
import {
	PresetAudioEncoderDict,
	PresetEncoderDict,
	PresetFormatDict,
	PresetPropertiesDict,
} from 'dict/presets.dict';
import { LanguageCodeToName } from 'funcs/locale.funcs';
import { BooleanToConfirmation } from 'funcs/string.funcs';
import { HandbrakePresetDataType } from 'types/preset';
import './preset-card-summary.scss';

type Params = {
	preset: HandbrakePresetDataType;
};

export default function PresetCardSummary({ preset }: Params) {
	const filters = [
		preset.PictureDetelecine != 'off'
			? `Detelecine (${PresetPropertiesDict[preset.PictureDetelecine]})`
			: 'off',
		preset.PictureDeinterlaceFilter != 'off'
			? `Deinterlace (${PresetPropertiesDict[preset.PictureDeinterlaceFilter]})`
			: 'off',
		preset.PictureDenoiseFilter != 'off'
			? `Denoise (${PresetPropertiesDict[preset.PictureDenoiseFilter]})`
			: 'off',
		preset.PictureChromaSmoothPreset != 'off'
			? `Chroma Smooth (${PresetPropertiesDict[preset.PictureChromaSmoothPreset]})`
			: 'off',
		preset.PictureSharpenFilter != 'off'
			? `Sharpen (${PresetPropertiesDict[preset.PictureSharpenFilter]})`
			: 'off',
		preset.PictureDeblockPreset != 'off'
			? `Deblock (${PresetPropertiesDict[preset.PictureDeblockPreset]})`
			: 'off',
		preset.PictureColorspacePreset != 'off'
			? `Colorspace (${PresetPropertiesDict[preset.PictureColorspacePreset]})`
			: 'off',
		preset.VideoGrayScale ? 'Grayscale' : undefined,
	].filter((filter) => filter && filter.toLowerCase() != 'off');

	return (
		<div className='preset-card-section' id='summary'>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Format</div>
				<TextInfo label='Format'>{PresetFormatDict[preset.FileFormat]}</TextInfo>
				<TextInfo label='Passthru Common Metadata'>
					{BooleanToConfirmation(preset.MetadataPassthrough)}
				</TextInfo>
			</div>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Video Track</div>
				<TextInfo label='Encoder'>{PresetEncoderDict[preset.VideoEncoder]}</TextInfo>
				<TextInfo label='Resolution'>
					{preset.PictureWidth}x{preset.PictureHeight}
				</TextInfo>
				<TextInfo label='FPS'>
					{preset.VideoFrameRate ? preset.VideoFrameRate : 'Same As Source'}
					{', '}
					{preset.VideoFramerateMode.toUpperCase()}
				</TextInfo>
				<TextInfo label='Chaper Markers'>
					{BooleanToConfirmation(preset.ChapterMarkers)}
				</TextInfo>
			</div>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Audio Tracks</div>
				{preset.AudioList.map((track, index) => (
					<div key={`summary-audio-track-${index}`}>
						{track.AudioEncoder
							? PresetAudioEncoderDict[track.AudioEncoder]
							: track.AudioEncoder}
					</div>
				))}
			</div>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Subtitles</div>
				{preset.SubtitleLanguageList.length > 0 ? (
					preset.SubtitleLanguageList.map((language, index) => (
						<div key={`summary-subtitle-language-${index}`}>
							{LanguageCodeToName(language)}
						</div>
					))
				) : (
					<div>N/A</div>
				)}
			</div>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Filters</div>
				{filters.length > 0 ? (
					filters.map((filter, index) => (
						<div key={`summary-filter-${index}`}>{filter}</div>
					))
				) : (
					<div>N/A</div>
				)}
			</div>
		</div>
	);
}

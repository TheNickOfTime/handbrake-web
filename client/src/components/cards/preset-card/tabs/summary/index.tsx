import TextInfo from '~components/base/info/text-info';
import {
	PresetAudioEncoderDict,
	PresetEncoderDict,
	PresetFormatDict,
	PresetPropertiesDict,
} from '~dict/presets.dict';
import { LanguageCodeToName } from '~funcs/locale.funcs';
import { BooleanToConfirmation } from '~funcs/string.funcs';
import { HandbrakePresetDataType } from '~types/preset';
import PresetSection from '../../components/preset-section';
import PresetTab from '../../components/preset-tab';

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
		<PresetTab>
			<PresetSection label='Format'>
				<TextInfo label='Format'>{PresetFormatDict[preset.FileFormat]}</TextInfo>
				<TextInfo label='Passthru Common Metadata'>
					{BooleanToConfirmation(preset.MetadataPassthrough)}
				</TextInfo>
			</PresetSection>
			<PresetSection label='Video Track'>
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
			</PresetSection>
			<PresetSection label='Audio Tracks'>
				{preset.AudioList.map((track, index) => (
					<div key={`summary-audio-track-${index}`}>
						{track.AudioEncoder
							? PresetAudioEncoderDict[track.AudioEncoder]
							: track.AudioEncoder}
					</div>
				))}
			</PresetSection>
			<PresetSection label='Subtitles'>
				{preset.SubtitleLanguageList.length > 0 ? (
					preset.SubtitleLanguageList.map((language, index) => (
						<div key={`summary-subtitle-language-${index}`}>
							{LanguageCodeToName(language)}
						</div>
					))
				) : (
					<div>N/A</div>
				)}
			</PresetSection>
			<PresetSection label='Filters'>
				{filters.length > 0 ? (
					filters.map((filter, index) => (
						<div key={`summary-filter-${index}`}>{filter}</div>
					))
				) : (
					<div>N/A</div>
				)}
			</PresetSection>
		</PresetTab>
	);
}

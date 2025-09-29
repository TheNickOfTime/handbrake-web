import {
	PresetAudioEncoderDict,
	PresetEncoderDict,
	PresetFormatDict,
	PresetPropertiesDict,
} from '@handbrake-web/shared/dict/presets.dict';
import { LanguageCodeToName } from '@handbrake-web/shared/funcs/locale.funcs';
import { BooleanToConfirmation } from '@handbrake-web/shared/funcs/string.funcs';
import { useContext } from 'react';
import TextInfo from '~components/base/info/text-info';
import PresetTab from '../../components/preset-tab';
import PresetTabSection from '../../components/preset-tab-section';
import { PresetCardContext } from '../../context';

export default function SummaryTab() {
	const { preset } = useContext(PresetCardContext)!;

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
		<PresetTab className='summary-tab'>
			<PresetTabSection label='Format'>
				<TextInfo label='Format'>{PresetFormatDict[preset.FileFormat]}</TextInfo>
				<TextInfo label='Passthru Common Metadata'>
					{BooleanToConfirmation(preset.MetadataPassthrough)}
				</TextInfo>
			</PresetTabSection>
			<PresetTabSection label='Video Track'>
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
			</PresetTabSection>
			<PresetTabSection label='Audio Tracks'>
				{preset.AudioList.map((track, index) => (
					<div key={`summary-audio-track-${index}`}>
						{track.AudioEncoder
							? PresetAudioEncoderDict[track.AudioEncoder]
							: track.AudioEncoder}
					</div>
				))}
			</PresetTabSection>
			<PresetTabSection label='Subtitles'>
				{preset.SubtitleLanguageList.length > 0 ? (
					preset.SubtitleLanguageList.map((language, index) => (
						<div key={`summary-subtitle-language-${index}`}>
							{LanguageCodeToName(language)}
						</div>
					))
				) : (
					<div>N/A</div>
				)}
			</PresetTabSection>
			<PresetTabSection label='Filters'>
				{filters.length > 0 ? (
					filters.map((filter, index) => (
						<div key={`summary-filter-${index}`}>{filter}</div>
					))
				) : (
					<div>N/A</div>
				)}
			</PresetTabSection>
		</PresetTab>
	);
}

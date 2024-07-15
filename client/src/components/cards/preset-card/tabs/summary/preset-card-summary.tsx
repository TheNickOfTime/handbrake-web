import TextInfo from 'components/base/info/text-info/text-info';
import { AudioEncoderLookup, HandbrakePresetData } from 'types/preset';
import './preset-card-summary.scss';

type Params = {
	preset: HandbrakePresetData;
};

export default function PresetCardSummary({ preset }: Params) {
	const filters = [
		preset.PictureDetelecine != 'off' ? 'detelecine' : 'off',
		preset.PictureDeinterlaceFilter,
		preset.PictureDenoiseFilter,
		preset.PictureChromaSmoothPreset != 'off' ? 'chroma smooth' : 'off',
		preset.PictureSharpenFilter,
		preset.PictureDeblockPreset != 'off' ? 'deblock' : 'off',
		preset.PictureColorspacePreset,
		preset.VideoGrayScale ? 'grayscale' : 'off',
	].filter((filter) => filter != 'off');

	return (
		<div className='preset-card-section' id='summary'>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Format</div>
				<TextInfo label='Format'>{preset.FileFormat}</TextInfo>
				<TextInfo label='Passthru Common Metadata'>
					{preset.MetadataPassthrough ? 'Yes' : 'No'}
				</TextInfo>
			</div>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Video Track</div>
				<TextInfo label='Encoder'>{preset.VideoEncoder}</TextInfo>
				<TextInfo label='Resolution'>
					{preset.PictureWidth}x{preset.PictureHeight}
				</TextInfo>
				<TextInfo label='FPS'>
					{preset.VideoFrameRate ? preset.VideoFrameRate : 'Same As Source'}
					{', '}
					{preset.VideoFramerateMode.toUpperCase()}
				</TextInfo>
				<TextInfo label='Chaper Markers'>{preset.ChapterMarkers ? 'Yes' : 'No'}</TextInfo>
			</div>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Audio Tracks</div>
				{preset.AudioList.map((track, index) => (
					<div key={`summary-audio-track-${index}`}>
						{AudioEncoderLookup[track.AudioEncoder]
							? AudioEncoderLookup[track.AudioEncoder]
							: track.AudioEncoder}
					</div>
				))}
			</div>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Subtitles</div>
				{preset.SubtitleLanguageList.length > 0 ? (
					preset.SubtitleLanguageList.map((language, index) => (
						<div key={`summary-subtitle-language-${index}`}>{language}</div>
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

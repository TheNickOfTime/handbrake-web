import TextInfo from 'components/base/info/text-info/text-info';
import { HandbrakePresetDataType } from 'types/preset.types';
import './preset-card-subtitles.scss';

type Params = {
	preset: HandbrakePresetDataType;
};

export default function PresetCardSubtitles({ preset }: Params) {
	return (
		<div className='preset-card-section' id='subtitles'>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Source Track Selection</div>
				<TextInfo label='Track Selection Behavior'>
					{preset.SubtitleTrackSelectionBehavior}
				</TextInfo>
				<TextInfo label='Selected Languages'>
					{preset.SubtitleLanguageList.join(', ')}
				</TextInfo>
			</div>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Options</div>
				<TextInfo label='Add Closed Captioons when available'>
					{preset.SubtitleAddCC ? 'Yes' : 'No'}
				</TextInfo>
				<TextInfo label="Add 'Foreign Audio Scan'">
					{preset.SubtitleAddForeignAudioSearch ? 'Yes' : 'No'}
				</TextInfo>
				<TextInfo label='Burn-In Behavior'>{preset.SubtitleBurnBehavior}</TextInfo>
			</div>
		</div>
	);
}

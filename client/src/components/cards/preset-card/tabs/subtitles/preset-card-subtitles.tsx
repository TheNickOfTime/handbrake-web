import TextInfo from 'components/base/info/text-info/text-info';
import { HandbrakePresetDataType } from 'types/preset';
import './preset-card-subtitles.scss';
import { FirstLetterUpperCase } from 'funcs/string.funcs';
import { LanguageCodeToName } from 'funcs/locale.funcs';

type Params = {
	preset: HandbrakePresetDataType;
};

export default function PresetCardSubtitles({ preset }: Params) {
	return (
		<div className='preset-card-section' id='subtitles'>
			<div className='preset-card-subsection'>
				<div className='preset-card-subsection-header'>Source Track Selection</div>
				<TextInfo label='Track Selection Behavior'>
					{FirstLetterUpperCase(preset.SubtitleTrackSelectionBehavior)}
				</TextInfo>
				<TextInfo label='Selected Languages'>
					{preset.SubtitleLanguageList.map((language) =>
						LanguageCodeToName(language)
					).join(', ')}
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
				<TextInfo label='Burn-In Behavior'>
					{FirstLetterUpperCase(preset.SubtitleBurnBehavior)}
				</TextInfo>
			</div>
		</div>
	);
}

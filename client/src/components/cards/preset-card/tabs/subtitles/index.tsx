import TextInfo from '~components/base/info/text-info';
import { LanguageCodeToName } from '~funcs/locale.funcs';
import { BooleanToConfirmation, FirstLetterUpperCase } from '~funcs/string.funcs';
import { HandbrakePresetDataType } from '~types/preset';
import PresetTab from '../../components/preset-tab';
import PresetTabSection from '../../components/preset-tab-section';

type Params = {
	preset: HandbrakePresetDataType;
};

export default function SubtitlesTab({ preset }: Params) {
	return (
		<PresetTab className='subtitles-tab'>
			<PresetTabSection label='Source Track Selection'>
				<TextInfo label='Track Selection Behavior'>
					{FirstLetterUpperCase(preset.SubtitleTrackSelectionBehavior)}
				</TextInfo>
				<TextInfo label='Selected Languages'>
					{preset.SubtitleLanguageList.map((language) =>
						LanguageCodeToName(language)
					).join(', ')}
				</TextInfo>
			</PresetTabSection>
			<PresetTabSection label='Options'>
				<TextInfo label='Add Closed Captioons when available'>
					{BooleanToConfirmation(preset.SubtitleAddCC)}
				</TextInfo>
				<TextInfo label="Add 'Foreign Audio Scan'">
					{BooleanToConfirmation(preset.SubtitleAddForeignAudioSearch)}
				</TextInfo>
				<TextInfo label='Burn-In Behavior'>
					{FirstLetterUpperCase(preset.SubtitleBurnBehavior)}
				</TextInfo>
			</PresetTabSection>
		</PresetTab>
	);
}

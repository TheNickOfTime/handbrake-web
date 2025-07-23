import TextInfo from '~components/base/info/text-info';
import { LanguageCodeToName } from '~funcs/locale.funcs';
import { BooleanToConfirmation, FirstLetterUpperCase } from '~funcs/string.funcs';
import { HandbrakePresetDataType } from '~types/preset';
import styles from './styles.module.scss';

type Params = {
	preset: HandbrakePresetDataType;
};

export default function PresetCardSubtitles({ preset }: Params) {
	return (
		<div className={styles['preset-card-section']} id='subtitles'>
			<div className={styles['preset-card-subsection']}>
				<div className={styles['preset-card-subsection-header']}>
					Source Track Selection
				</div>
				<TextInfo label='Track Selection Behavior'>
					{FirstLetterUpperCase(preset.SubtitleTrackSelectionBehavior)}
				</TextInfo>
				<TextInfo label='Selected Languages'>
					{preset.SubtitleLanguageList.map((language) =>
						LanguageCodeToName(language)
					).join(', ')}
				</TextInfo>
			</div>
			<div className={styles['preset-card-subsection']}>
				<div className={styles['preset-card-subsection-header']}>Options</div>
				<TextInfo label='Add Closed Captioons when available'>
					{BooleanToConfirmation(preset.SubtitleAddCC)}
				</TextInfo>
				<TextInfo label="Add 'Foreign Audio Scan'">
					{BooleanToConfirmation(preset.SubtitleAddForeignAudioSearch)}
				</TextInfo>
				<TextInfo label='Burn-In Behavior'>
					{FirstLetterUpperCase(preset.SubtitleBurnBehavior)}
				</TextInfo>
			</div>
		</div>
	);
}

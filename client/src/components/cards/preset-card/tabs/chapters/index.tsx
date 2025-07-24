import TextInfo from '~components/base/info/text-info';
import { BooleanToConfirmation } from '~funcs/string.funcs';
import { HandbrakePresetDataType } from '~types/preset';
import PresetTab from '../../components/preset-tab';
import styles from './styles.module.scss';

type Params = {
	preset: HandbrakePresetDataType;
};

export default function ChaptersTab({ preset }: Params) {
	return (
		<PresetTab className={styles['chapters-tab']}>
			<TextInfo label='Create chapter markers'>
				{BooleanToConfirmation(preset.ChapterMarkers)}
			</TextInfo>
		</PresetTab>
	);
}

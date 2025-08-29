import { useContext } from 'react';
import TextInfo from '~components/base/info/text-info';
import { BooleanToConfirmation } from '~funcs/string.funcs';
import PresetTab from '../../components/preset-tab';
import { PresetCardContext } from '../../context';
import styles from './styles.module.scss';

export default function ChaptersTab() {
	const { preset } = useContext(PresetCardContext)!;

	return (
		<PresetTab className={styles['chapters-tab']}>
			<TextInfo label='Create chapter markers'>
				{BooleanToConfirmation(preset.ChapterMarkers)}
			</TextInfo>
		</PresetTab>
	);
}

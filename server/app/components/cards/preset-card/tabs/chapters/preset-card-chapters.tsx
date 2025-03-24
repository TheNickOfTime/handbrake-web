import TextInfo from 'components/base/info/text-info/text-info';
import { BooleanToConfirmation } from 'funcs/string.funcs';
import { HandbrakePresetDataType } from 'types/preset';

type Params = {
	preset: HandbrakePresetDataType;
};

export default function PresetCardChapters({ preset }: Params) {
	return (
		<div className='preset-card-section' id='chapters'>
			<TextInfo label='Create chapter markers'>
				{BooleanToConfirmation(preset.ChapterMarkers)}
			</TextInfo>
		</div>
	);
}

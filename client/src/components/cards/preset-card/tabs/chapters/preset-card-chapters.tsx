import TextInfo from 'components/base/info/text-info/text-info';
import { HandbrakePresetDataType } from 'types/preset.types';

type Params = {
	preset: HandbrakePresetDataType;
};

export default function PresetCardChapters({ preset }: Params) {
	return (
		<div className='preset-card-section' id='chapters'>
			<TextInfo label='Create chapter markers'>
				{preset.ChapterMarkers ? 'Yes' : 'No'}
			</TextInfo>
		</div>
	);
}

import TextInfo from 'components/base/info/text-info/text-info';
import { HandbrakePresetData } from 'types/preset';

type Params = {
	preset: HandbrakePresetData;
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

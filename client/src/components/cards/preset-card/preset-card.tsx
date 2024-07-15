import { useState } from 'react';
import { HandbrakePresetData } from 'types/preset';
import ButtonInput from 'components/base/inputs/button/button-input';
import PresetCardSummary from './tabs/summary/preset-card-summary';
import PresetCardDimensions from './tabs/dimensions/preset-card-dimensions';
import './preset-card.scss';
import PresetCardFilters from './tabs/filters/preset-card-filters';
import PresetCardVideo from './tabs/video/preset-card-video';
import PresetCardAudio from './tabs/audio/preset-card-audio';
import PresetCardSubtitles from './tabs/subtitles/preset-card-subtitles';
import PresetCardChapters from './tabs/chapters/preset-card-chapters';

type Params = {
	preset: HandbrakePresetData;
	handleRemovePreset: (preset: string) => void;
};

enum PresetTabs {
	Summary,
	Dimensions,
	Filters,
	Video,
	Audio,
	Subtitles,
	Chapters,
}

export default function PresetCard({ preset, handleRemovePreset }: Params) {
	const [currentTab, setCurrentTab] = useState(PresetTabs.Summary);

	const tabs = ['Summary', 'Dimensions', 'Filters', 'Video', 'Audio', 'Subtitles', 'Chapters'];

	return (
		<div className='preset-card'>
			<div className='preset-header'>
				<h3 className='preset-label'>{preset.PresetName}</h3>
				<div className='preset-buttons'>
					{/* <ButtonInput
						icon='bi-pencil-square'
						color='yellow'
						onClick={() => {}}
					/> */}
					<ButtonInput
						icon='bi-trash-fill'
						color='red'
						onClick={() => handleRemovePreset(preset.PresetName)}
					/>
				</div>
			</div>
			<div className='preset-body'>
				<div className='preset-tabs'>
					{tabs.map((tab, index) => (
						<button
							className={index == currentTab ? 'current' : undefined}
							key={tab}
							onClick={() => setCurrentTab(index)}
						>
							{tab}
						</button>
					))}
				</div>
				<div className='current-tab'>
					{(() => {
						switch (currentTab) {
							case PresetTabs.Summary:
								return <PresetCardSummary preset={preset} />;
							case PresetTabs.Dimensions:
								return <PresetCardDimensions preset={preset} />;
							case PresetTabs.Filters:
								return <PresetCardFilters preset={preset} />;
							case PresetTabs.Video:
								return <PresetCardVideo preset={preset} />;
							case PresetTabs.Audio:
								return <PresetCardAudio preset={preset} />;
							case PresetTabs.Subtitles:
								return <PresetCardSubtitles preset={preset} />;
							case PresetTabs.Chapters:
								return <PresetCardChapters preset={preset} />;
							default:
								return null;
						}
					})()}
				</div>
			</div>
		</div>
	);
}

import { useState } from 'react';
import { HandbrakePresetType } from 'types/preset';
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
	preset: HandbrakePresetType;
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

	const presetData = preset.PresetList[0];
	const tabs = ['Summary', 'Dimensions', 'Filters', 'Video', 'Audio', 'Subtitles', 'Chapters'];

	const handleDownloadPreset = () => {
		const presetBlob = new Blob([JSON.stringify(preset, null, 2)], {
			type: 'application/json',
		});
		const presetURL = URL.createObjectURL(presetBlob);
		const downloadElement = document.createElement('a');

		downloadElement.href = presetURL;
		downloadElement.download = `${presetData.PresetName}.json`;
		document.body.appendChild(downloadElement);
		downloadElement.click();
		document.body.removeChild(downloadElement);

		URL.revokeObjectURL(presetURL);
	};

	return (
		<div className='preset-card'>
			<div className='preset-header'>
				<h3 className='preset-label'>{presetData.PresetName}</h3>
				<div className='preset-buttons'>
					{/* <ButtonInput
						icon='bi-pencil-square'
						color='yellow'
						onClick={() => {}}
					/> */}
					<ButtonInput
						icon='bi-download'
						color='blue'
						title='Download Preset'
						onClick={handleDownloadPreset}
					/>
					<ButtonInput
						icon='bi-trash-fill'
						color='red'
						title='Remove Preset'
						onClick={() => handleRemovePreset(presetData.PresetName)}
					/>
				</div>
			</div>
			<div className='preset-body'>
				<div className='preset-tabs'>
					{tabs.map((tab, index) => (
						<div className='tab-button-container' key={tab}>
							<button
								className={index == currentTab ? 'current' : undefined}
								onClick={() => setCurrentTab(index)}
							>
								<span className='tab-button-label'>{tab}</span>
							</button>
						</div>
					))}
				</div>
				<div className='current-tab'>
					{(() => {
						switch (currentTab) {
							case PresetTabs.Summary:
								return <PresetCardSummary preset={presetData} />;
							case PresetTabs.Dimensions:
								return <PresetCardDimensions preset={presetData} />;
							case PresetTabs.Filters:
								return <PresetCardFilters preset={presetData} />;
							case PresetTabs.Video:
								return <PresetCardVideo preset={presetData} />;
							case PresetTabs.Audio:
								return <PresetCardAudio preset={presetData} />;
							case PresetTabs.Subtitles:
								return <PresetCardSubtitles preset={presetData} />;
							case PresetTabs.Chapters:
								return <PresetCardChapters preset={presetData} />;
							default:
								return null;
						}
					})()}
				</div>
			</div>
		</div>
	);
}

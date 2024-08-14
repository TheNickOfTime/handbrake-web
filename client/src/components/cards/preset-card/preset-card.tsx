import { useState } from 'react';
import { HandbrakePresetType } from 'types/preset';
import ButtonInput from 'components/base/inputs/button/button-input';
import PresetCardSummary from './tabs/summary/preset-card-summary';
import PresetCardDimensions from './tabs/dimensions/preset-card-dimensions';
import PresetCardFilters from './tabs/filters/preset-card-filters';
import PresetCardVideo from './tabs/video/preset-card-video';
import PresetCardAudio from './tabs/audio/preset-card-audio';
import PresetCardSubtitles from './tabs/subtitles/preset-card-subtitles';
import PresetCardChapters from './tabs/chapters/preset-card-chapters';
import './preset-card.scss';

type Params = {
	preset: HandbrakePresetType;
	category: string;
	handleRenamePreset?: (oldName: string, newName: string, category: string) => void;
	handleRemovePreset: (preset: string, category: string) => void;
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

export default function PresetCard({
	preset,
	category,
	handleRenamePreset,
	handleRemovePreset,
}: Params) {
	const [currentTab, setCurrentTab] = useState(PresetTabs.Summary);
	const [presetName, setPresetName] = useState(preset.PresetList[0].PresetName);

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

	const handleRenameInputSubmit = (
		event: React.FormEvent<HTMLFormElement | HTMLInputElement>
	) => {
		event.preventDefault();
		if (presetName != preset.PresetList[0].PresetName) {
			handleRenamePreset!(preset.PresetList[0].PresetName, presetName, category);
		}
	};

	return (
		<div className='preset-card'>
			<div className='preset-header'>
				{handleRenamePreset ? (
					<form className='header-label-form' onSubmit={handleRenameInputSubmit}>
						<input
							type='text'
							className='header-label-input'
							value={presetName}
							onChange={(event) => setPresetName(event.target.value)}
							onBlur={handleRenameInputSubmit}
							// onSubmit={handleRenameInputSubmit}
						/>
					</form>
				) : (
					<h3 className='preset-label'>{presetName}</h3>
				)}
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
						onClick={() => handleRemovePreset(presetData.PresetName, category)}
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

import DownloadIcon from '@icons/download.svg?react';
import DeleteIcon from '@icons/trash-fill.svg?react';
import { useState } from 'react';
import ButtonInput from '~components/base/inputs/button';
import { HandbrakePresetType } from '~types/preset';
import styles from './styles.module.scss';
import PresetCardAudio from './tabs/audio';
import PresetCardChapters from './tabs/chapters';
import PresetCardDimensions from './tabs/dimensions';
import PresetCardFilters from './tabs/filters';
import PresetCardSubtitles from './tabs/subtitles';
import PresetCardSummary from './tabs/summary';
import PresetCardVideo from './tabs/video';

type Params = {
	preset: HandbrakePresetType;
	category: string;
	canModify?: boolean;
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
	canModify = false,
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
		<div className={styles['preset-card']}>
			<div className={styles['heading']}>
				{handleRenamePreset ? (
					<form
						className={styles['header-label-form']}
						onSubmit={handleRenameInputSubmit}
					>
						<input
							type='text'
							className={styles['header-label-input']}
							value={presetName}
							onChange={(event) => setPresetName(event.target.value)}
							onBlur={handleRenameInputSubmit}
							// onSubmit={handleRenameInputSubmit}
						/>
					</form>
				) : (
					<h3 className={styles['preset-label']}>{presetName}</h3>
				)}
				<div className={styles['preset-buttons']}>
					{/* <ButtonInput
						icon='bi-pencil-square'
						color='yellow'
						onClick={() => {}}
					/> */}
					<ButtonInput
						Icon={DownloadIcon}
						color='blue'
						title='Download Preset'
						onClick={handleDownloadPreset}
					/>
					{canModify && (
						<ButtonInput
							Icon={DeleteIcon}
							color='red'
							title='Remove Preset'
							onClick={() => handleRemovePreset(presetData.PresetName, category)}
						/>
					)}
				</div>
			</div>
			{preset.PresetList[0].VideoEncoder == undefined && (
				<div className={styles['warning']}>
					<i className='bi bi-exclamation-circle-fill' />
					<span>Attention: </span>
					<span>
						This preset has missing information. Want to help? See{' '}
						<a href='https://github.com/TheNickOfTime/handbrake-web/issues/205'>
							Issue #205
						</a>{' '}
						over at the project's GitHub.
					</span>
				</div>
			)}
			<div className={styles['body']}>
				<div className={styles['tabs']}>
					{tabs.map((tab, index) => (
						<div className={styles['tab-wrapper']} key={tab}>
							<button
								onClick={() => setCurrentTab(index)}
								data-current={index == currentTab}
							>
								<span className={styles['tab-button-label']}>{tab}</span>
							</button>
						</div>
					))}
				</div>
				<div className={styles['current-tab']}>
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

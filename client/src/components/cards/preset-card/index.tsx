import { HandbrakePresetType } from '@handbrake-web/shared/types/preset';
import { TranscodeStage } from '@handbrake-web/shared/types/transcode';
import DownloadIcon from '@icons/download.svg?react';
import WarningIcon from '@icons/exclamation-circle.svg?react';
import DeleteIcon from '@icons/trash-fill.svg?react';
import { HTMLAttributes, useContext, useState } from 'react';
import ButtonInput from '~components/base/inputs/button';
import { PrimaryContext } from '~layouts/primary/context';
import { PresetCardContext } from './context';
import styles from './styles.module.scss';
import AudioTab from './tabs/audio';
import ChaptersTab from './tabs/chapters';
import DimensionsTab from './tabs/dimensions';
import FiltersTab from './tabs/filters';
import SubtitlesTab from './tabs/subtitles';
import SummaryTab from './tabs/summary';
import VideoTab from './tabs/video';

interface Properties extends HTMLAttributes<HTMLDivElement> {
	preset: HandbrakePresetType;
	category: string;
	canModify?: boolean;
	canDelete?: boolean;
	handleRenamePreset?: (oldName: string, newName: string, category: string) => void;
	handleRemovePreset: (preset: string, category: string) => void;
}

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
	canDelete = false,
	handleRenamePreset,
	handleRemovePreset,
	className,
	...properties
}: Properties) {
	const { queue } = useContext(PrimaryContext)!;

	const [currentTab, setCurrentTab] = useState(PresetTabs.Summary);
	const [presetName, setPresetName] = useState(preset.PresetList[0].PresetName);

	const presetData = preset.PresetList[0];
	const tabs = ['Summary', 'Dimensions', 'Filters', 'Video', 'Audio', 'Subtitles', 'Chapters'];

	const canModifyDefault = canModify;

	canModify =
		canModify &&
		!queue.find(
			(job) =>
				job.transcode_stage != TranscodeStage.Finished &&
				category == job.preset_category &&
				preset.PresetList[0].PresetName == job.preset_id
		);

	const noModifyInfo =
		'The preset is currently in use by a job - it cannot be modified or deleted.';

	const deleteButtonInfo = canModifyDefault && !canModify ? noModifyInfo : 'Delete Preset';

	const renameInfo = canModifyDefault && !canModify ? noModifyInfo : undefined;

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
		<div className={`preset-card ${styles['preset-card']} ${className || ''}`} {...properties}>
			<div className={styles['heading']}>
				{canModifyDefault && handleRenamePreset ? (
					<form className={styles['label-form']} onSubmit={handleRenameInputSubmit}>
						<input
							type='text'
							className={styles['label-input']}
							value={presetName}
							title={renameInfo}
							disabled={!canModify}
							onChange={(event) => setPresetName(event.target.value)}
							onBlur={handleRenameInputSubmit}
							// onSubmit={handleRenameInputSubmit}
						/>
					</form>
				) : (
					<h3 className={styles['label']}>{presetName}</h3>
				)}
				<div className={styles['buttons']}>
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
					{canDelete && (
						<ButtonInput
							Icon={DeleteIcon}
							color='red'
							title={deleteButtonInfo}
							disabled={!canModify}
							onClick={() => handleRemovePreset(presetData.PresetName, category)}
						/>
					)}
				</div>
			</div>
			{preset.PresetList[0].VideoEncoder == undefined && (
				<div className={styles['warning']}>
					<WarningIcon />
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
					<PresetCardContext value={{ preset: presetData }}>
						{(() => {
							switch (currentTab) {
								case PresetTabs.Summary:
									return <SummaryTab />;
								case PresetTabs.Dimensions:
									return <DimensionsTab />;
								case PresetTabs.Filters:
									return <FiltersTab />;
								case PresetTabs.Video:
									return <VideoTab />;
								case PresetTabs.Audio:
									return <AudioTab />;
								case PresetTabs.Subtitles:
									return <SubtitlesTab />;
								case PresetTabs.Chapters:
									return <ChaptersTab />;
								default:
									return null;
							}
						})()}
					</PresetCardContext>
				</div>
			</div>
		</div>
	);
}

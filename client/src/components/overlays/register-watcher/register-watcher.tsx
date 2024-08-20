import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DirectoryItemType } from 'types/directory';
import { FileBrowserMode } from 'types/file-browser';
import { WatcherDefinitionType } from 'types/watcher';
import ButtonInput from 'components/base/inputs/button/button-input';
import PathInput from 'components/base/inputs/path/path-input';
import SelectInput from 'components/base/inputs/select/select-input';
import SectionOverlay from 'components/section/section-overlay';
import { PrimaryOutletContextType } from 'pages/primary/primary-context';
import './register-watcher.scss';
import { FirstLetterUpperCase } from 'funcs/string.funcs';

type Params = {
	onClose: () => void;
};

export default function RegisterWatcher({ onClose }: Params) {
	const { config, presets, defaultPresets, socket } =
		useOutletContext<PrimaryOutletContextType>();

	const [watchPath, setWatchPath] = useState('');
	const [outputPath, setOutputPath] = useState('');
	const [presetCategory, setPresetCategory] = useState('');
	const [presetID, setPresetID] = useState('');
	const [isDefaultPreset, setIsDefaultPreset] = useState(false);

	const canSubmit = watchPath && presetID;

	const handleWatchPathConfirm = (item: DirectoryItemType) => {
		setWatchPath(item.path);
	};

	const handleOutputPathConfirm = (item: DirectoryItemType) => {
		setOutputPath(item.path);
	};

	const handlePresetCategoryChange = (category: string) => {
		setIsDefaultPreset(category.includes('Default: '));
	};

	const handleSubmit = () => {
		const newWatcher: WatcherDefinitionType = {
			watch_path: watchPath,
			output_path: outputPath ? outputPath : null,
			preset_category: presetCategory,
			preset_id: presetID,
		};
		socket.emit('add-watcher', newWatcher);
		onClose();
	};

	const handleCancel = () => {
		onClose();
	};

	return (
		<SectionOverlay id='register-watcher'>
			<h1>Register Watcher</h1>
			<div className='register-watcher-fields'>
				<div className='fields-section'>
					<PathInput
						id='watcher-watch-path'
						label='Directory to Watch:'
						startPath={config.paths['input-path']}
						rootPath={config.paths['media-path']}
						mode={FileBrowserMode.Directory}
						value={watchPath}
						onConfirm={handleWatchPathConfirm}
					/>
					<PathInput
						id='watcher-output-path'
						label='Output Directory:'
						startPath={config.paths['output-path'] || config.paths['media-path']}
						rootPath={config.paths['media-path']}
						mode={FileBrowserMode.Directory}
						value={outputPath}
						onConfirm={handleOutputPathConfirm}
					/>
					<SelectInput
						id='watcher-preset-category-select'
						label='Preset Category'
						value={presetCategory}
						setValue={setPresetCategory}
						onChange={handlePresetCategoryChange}
					>
						<option value=''>N/A</option>
						{Object.keys(presets)
							.filter((category) => Object.keys(presets[category]).length)
							.sort((a, b) =>
								a == 'uncategorized' || a.toLowerCase() > b.toLowerCase() ? 1 : -1
							)
							.map((category) => (
								<option value={category} key={`preset-category-${category}`}>
									{category == 'uncategorized'
										? FirstLetterUpperCase(category)
										: category}
								</option>
							))}
						{config.presets['show-default-presets'] &&
							Object.keys(defaultPresets).map((category) => (
								<option
									value={`Default: ${category}`}
									key={`default-preset-category-${category}`}
								>
									Default: {category}
								</option>
							))}
					</SelectInput>
					<SelectInput
						id='watcher-preset-select'
						label='Preset:'
						value={presetID}
						setValue={setPresetID}
					>
						<option value=''>N/A</option>
						{isDefaultPreset &&
							defaultPresets[presetCategory.replace(/^Default:\s/, '')] &&
							Object.keys(
								defaultPresets[presetCategory.replace(/^Default:\s/, '')]
							).map((preset) => (
								<option value={preset} key={`preset-${preset}`}>
									{preset}
								</option>
							))}
						{!isDefaultPreset &&
							presets[presetCategory] &&
							Object.keys(presets[presetCategory]).map((preset) => (
								<option value={preset} key={`preset-${preset}`}>
									{preset}
								</option>
							))}
					</SelectInput>
					{/* <div className='inline'>
						<SelectInput
							id='watcher-mask-select'
							label='Default Watch Behavior:'
							value={defaultMask}
							setValue={setDefaultMask}
						>
							<option value={WatcherRuleMaskMethods.Include}>
								Watch All Files In Directory
							</option>
							<option value={WatcherRuleMaskMethods.Exclude}>
								Ignore All Files In Directory
							</option>
						</SelectInput>
						<BadgeInfo
							info={`You can modify the default behavior with rules.\n\nexample: Set to 'Ignore All Files in Directory', and create rules with 'Watch' behavior to only watch specific files.`}
						/>
					</div> */}
				</div>
				<div className='buttons-section'>
					<ButtonInput label='Cancel' color='red' onClick={handleCancel} />
					<ButtonInput
						label='Submit'
						color='green'
						disabled={!canSubmit}
						onClick={handleSubmit}
					/>
				</div>
			</div>
		</SectionOverlay>
	);
}

import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DirectoryItemType } from 'types/directory.types';
import { FileBrowserMode } from 'types/file-browser.types';
import { WatcherDefinitionType } from 'types/watcher.types';
import ButtonInput from 'components/base/inputs/button/button-input';
import PathInput from 'components/base/inputs/path/path-input';
import SelectInput from 'components/base/inputs/select/select-input';
import SectionOverlay from 'components/section/section-overlay';
import { PrimaryOutletContextType } from 'pages/primary/primary-context';
import './register-watcher.scss';

type Params = {
	onClose: () => void;
};

export default function RegisterWatcher({ onClose }: Params) {
	const { config, presets, socket } = useOutletContext<PrimaryOutletContextType>();

	const [watchPath, setWatchPath] = useState('');
	const [outputPath, setOutputPath] = useState('');
	const [presetID, setPresetID] = useState('');

	const canSubmit = watchPath && presetID;

	const handleWatchPathConfirm = (item: DirectoryItemType) => {
		setWatchPath(item.path);
	};

	const handleOutputPathConfirm = (item: DirectoryItemType) => {
		setOutputPath(item.path);
	};

	const handleSubmit = () => {
		const newWatcher: WatcherDefinitionType = {
			watch_path: watchPath,
			output_path: outputPath,
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
						path={config['input-path']}
						mode={FileBrowserMode.Directory}
						value={watchPath}
						onConfirm={handleWatchPathConfirm}
					/>
					<PathInput
						id='watcher-output-path'
						label='Output Directory:'
						path={config['output-path']}
						mode={FileBrowserMode.Directory}
						value={outputPath}
						onConfirm={handleOutputPathConfirm}
					/>
					<SelectInput
						id='watcher-preset-select'
						label='Preset:'
						value={presetID}
						setValue={setPresetID}
					>
						<option value=''>N/A</option>
						{Object.keys(presets).map((preset) => (
							<option value={preset} key={preset}>
								{preset}
							</option>
						))}
					</SelectInput>
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

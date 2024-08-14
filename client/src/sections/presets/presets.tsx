import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from 'pages/primary/primary-context';
import Section from 'components/section/section';
import UploadPreset from 'components/overlays/upload-preset/upload-preset';
import PresetsButtons from './sub-sections/presets-buttons';
import PresetsList from './sub-sections/presets-list';
import './presets.scss';

export default function PresetsSection() {
	const { config, presets, defaultPresets, socket } =
		useOutletContext<PrimaryOutletContextType>();

	const [showUploadPreset, setShowUploadPreset] = useState(false);

	const handleOpenUploadPreset = () => {
		setShowUploadPreset(true);
	};

	const handleCloseUploadPreset = () => {
		setShowUploadPreset(false);
	};

	const handleRenamePreset = (oldName: string, newName: string) => {
		socket.emit('rename-preset', oldName, newName);
	};

	const handleRemovePreset = (preset: string) => {
		socket.emit('remove-preset', preset);
		console.log(`[client] Requesting the server remove preset '${preset}'`);
	};

	return (
		<Section
			title='Presets'
			id='presets'
			className={showUploadPreset ? 'no-scroll-y' : undefined}
		>
			<PresetsButtons
				presets={{ ...presets, ...defaultPresets }}
				handleOpenUploadPreset={handleOpenUploadPreset}
			/>
			<PresetsList
				label='Presets'
				presets={presets}
				allowRename={true}
				handleRenamePreset={handleRenamePreset}
				handleRemovePreset={handleRemovePreset}
			/>
			{config.presets['show-default-presets'] && (
				<PresetsList
					label='Default Presets'
					presets={defaultPresets}
					handleRenamePreset={handleRenamePreset}
					handleRemovePreset={handleRemovePreset}
				/>
			)}
			{showUploadPreset && (
				<UploadPreset
					socket={socket}
					presets={Object.keys(presets).sort()}
					handleClose={handleCloseUploadPreset}
				/>
			)}
		</Section>
	);
}

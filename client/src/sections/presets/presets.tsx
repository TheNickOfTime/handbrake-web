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

	const handleRenamePreset = (oldName: string, newName: string, category: string) => {
		socket.emit('rename-preset', oldName, newName, category);
	};

	const handleRemovePreset = (preset: string, category: string) => {
		socket.emit('remove-preset', preset, category);
		console.log(`[client] Requesting the server remove preset '${category}/${preset}'`);
	};

	return (
		<Section
			title='Presets'
			id='presets'
			className={showUploadPreset ? 'no-scroll-y' : undefined}
		>
			<PresetsButtons
				presets={
					config.presets['show-default-presets']
						? { ...presets, ...defaultPresets }
						: presets
				}
				handleOpenUploadPreset={handleOpenUploadPreset}
			/>
			<PresetsList
				label='Presets'
				presets={presets}
				collapsed={false}
				canModify={true}
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
					presets={presets}
					handleClose={handleCloseUploadPreset}
				/>
			)}
		</Section>
	);
}

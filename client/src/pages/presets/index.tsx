import { useContext, useState } from 'react';
import UploadPreset from '~components/overlays/upload-preset';
import Page from '~components/root/page';
import { PrimaryContext } from '~layouts/primary/context';
import PresetsButtons from './sections/buttons-section';
import PresetsList from './sections/list-section';
import styles from './styles.module.scss';

export default function PresetsPage() {
	const { config, queue, presets, defaultPresets, socket } = useContext(PrimaryContext)!;

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
		<Page className={styles['presets']} heading='Presets'>
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
				canDelete={true}
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
		</Page>
	);
}

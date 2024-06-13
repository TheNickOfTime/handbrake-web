import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from '../../pages/primary/primary-context';
import Section from '../../components/section/section';
import UploadPreset from '../../components/overlays/upload-preset/upload-preset';
import PresetsButtons from './sub-sections/presets-buttons';
import PresetsList from './sub-sections/presets-list';
import './presets.scss';

export default function PresetsSection() {
	const { presets, socket } = useOutletContext<PrimaryOutletContextType>();

	const [showUploadPreset, setShowUploadPreset] = useState(false);

	const showPresetList = Object.keys(presets).length > 0;

	const handleOpenUploadPreset = () => {
		setShowUploadPreset(true);
	};

	const handleCloseUploadPreset = () => {
		setShowUploadPreset(false);
	};

	// const handleEditPresetName = () => {};

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
			<PresetsButtons presets={presets} handleOpenUploadPreset={handleOpenUploadPreset} />
			{showPresetList && (
				<PresetsList presets={presets} handleRemovePreset={handleRemovePreset} />
			)}
			{showUploadPreset && (
				<UploadPreset socket={socket} handleClose={handleCloseUploadPreset} />
			)}
		</Section>
	);
}

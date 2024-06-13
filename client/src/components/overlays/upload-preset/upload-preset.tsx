import { useState } from 'react';
import { Socket } from 'socket.io-client';
import { HandbrakePreset } from '../../../../../types/preset';
import ButtonInput from '../../base/inputs/button/button-input';
import './upload-preset.scss';
import SectionOverlay from '../../section/section-overlay';

type Params = {
	socket: Socket;
	handleClose: () => void;
};

export default function UploadPreset({ socket, handleClose }: Params) {
	const [preset, setPreset] = useState<null | HandbrakePreset>(null);
	const [presetName, setPresetName] = useState('');

	const handlePresetFile = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file && file.type == 'application/json') {
			// if (showError) {
			// 	setShowError(false);
			// }

			const reader = new FileReader();
			reader.onload = (event) => {
				const result = event.target?.result?.toString();
				const json: HandbrakePreset = JSON.parse(result!);
				setPreset(json);
				setPresetName(json.PresetList[0].PresetName);
				console.log(`[client] Preset has been updated to '${file.name}'`);
			};
			reader.readAsText(file);
		}
	};

	const handlePresetName = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newName = event.target.value;
		const newPreset = preset;
		preset!.PresetList[0].PresetName = newName;
		setPreset(newPreset);
		setPresetName(event.target.value);
	};

	const handleAddPreset = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		if (preset && presetName != '') {
			socket.emit('add-preset', preset);
		}
		handleClose();
	};

	return (
		<SectionOverlay id='upload-preset'>
			<h1>Upload Preset</h1>
			<div className='file-section'>
				<label htmlFor='preset-file'>Preset: </label>
				<input
					className='file-upload'
					type='file'
					id='preset-file'
					onChange={handlePresetFile}
				/>
			</div>
			<div>
				{preset && (
					<div className='preset-name-section'>
						<label htmlFor='preset-name'>Preset Name: </label>
						<input
							type='text'
							id='preset-name'
							value={presetName}
							onChange={handlePresetName}
						/>
					</div>
				)}
			</div>
			<div className='buttons-section'>
				<ButtonInput label='Cancel' color='red' onClick={handleClose} />
				<ButtonInput
					label='Upload'
					color='blue'
					disabled={preset == null && presetName == ''}
					onClick={handleAddPreset}
				/>
			</div>
		</SectionOverlay>
	);
}

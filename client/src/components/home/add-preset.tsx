import { useState } from 'react';
import { Socket } from 'socket.io-client';
import { HandbrakePreset } from '../../../../types/preset';
import TextInput from '../test/text-input';

type Params = {
	socket: Socket;
	// presets: object;
};

export default function AddPreset({ socket }: Params) {
	const [preset, setPreset] = useState<null | HandbrakePreset>(null);
	const [presetName, setPresetName] = useState('');
	const [collapsed, setCollapsed] = useState(true);
	const icon = collapsed ? 'bi-caret-down-fill' : 'bi-caret-up-fill';

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

	const handleAddPreset = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		if (preset && presetName != '') {
			socket.emit('add-preset', preset);
		}
	};

	return (
		<div className='container'>
			<div className='d-flex'>
				<h2>Add Preset</h2>
				<button className='btn btn-link' onClick={() => setCollapsed(!collapsed)}>
					<i className={`bi ${icon}`} />
				</button>
			</div>
			<div className='card card-body' hidden={collapsed}>
				<div className='row'>
					<div className='col'>
						<label className='form-label' htmlFor='preset-file'>
							Preset File (JSON):
						</label>
						<input
							className='form-control'
							type='file'
							id='preset-file'
							accept='.json'
							onChange={handlePresetFile}
						/>
					</div>
					<div className='col'>
						{/* <label htmlFor='preset-name'>Preset Name:</label> */}
						<TextInput
							id='preset-name'
							label='Preset Name:'
							value={presetName}
							setValue={setPresetName}
						/>
					</div>
				</div>
				<button
					className='btn btn-primary'
					onClick={handleAddPreset}
					disabled={preset == null && presetName == ''}
				>
					Add Preset
				</button>
			</div>
		</div>
	);
}

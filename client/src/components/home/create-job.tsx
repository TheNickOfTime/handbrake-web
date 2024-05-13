import TextInput from '../test/text-input';
import { QueueRequest } from '../../../../types/queue';
import { Socket } from 'socket.io-client';
import { useState } from 'react';
import FileBrowser from '../file-browser/file-browser';

type Params = {
	socket: Socket;
	input: string;
	setInput: React.Dispatch<React.SetStateAction<string>>;
	output: string;
	setOutput: React.Dispatch<React.SetStateAction<string>>;
	presets: string[];
	preset: string | null;
	setPreset: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function CreateJob({
	socket,
	input,
	setInput,
	output,
	setOutput,
	presets,
	preset,
	setPreset,
}: Params) {
	const [showError, setShowError] = useState(false);

	const defaultFileExtension = '.mkv';

	const handleFileConfirm = (file: string) => {
		const newInput = file;
		const newOutput = file.replace(/\.[\w\d]+$/, defaultFileExtension);
		setInput(newInput);
		setOutput(newOutput);
	};

	const handlePresetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const isNA = event.target.value == 'N/A';
		if (showError && !isNA) {
			setShowError(false);
		}
		setPreset(isNA ? null : event.target.value);
	};

	const handleAddToQueue = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		if (preset) {
			const data: QueueRequest = {
				input: input,
				output: output,
				preset: preset!,
			};
			socket.emit('add-to-queue', data);
		} else {
			console.error('[client] There is no preset file to send to the server.');
			setShowError(true);
		}
	};

	const handleStartQueue = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		socket.emit('start-queue');
	};

	const handleStopQueue = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		socket.emit('stop-queue');
	};

	return (
		<div className='container'>
			<h2>Create Job</h2>
			<FileBrowser socket={socket} onConfirm={handleFileConfirm} />
			<br />
			<form>
				<div className='row'>
					<div className='col'>
						<label htmlFor='preset-select' className='form-label'>
							Select Preset:
						</label>
						<select
							className='form-select'
							id='preset-select'
							onChange={handlePresetChange}
							value={preset ? preset : 'N/A'}
						>
							<option value={undefined} selected>
								N/A
							</option>
							{presets.map((preset) => (
								<option key={preset} value={preset}>
									{preset}
								</option>
							))}
						</select>
					</div>
					<div className='col'>
						<TextInput
							id='output'
							label='Output Path:'
							value={output}
							setValue={setOutput}
							readOnly={true}
						/>
					</div>
				</div>
			</form>
			{showError && <div className='alert alert-danger'>No preset has been selected.</div>}
			<div className='d-flex gap-2 mt-3'>
				<button className='btn btn-warning' onClick={handleAddToQueue}>
					Add to Queue
				</button>
				<button className='btn btn-primary' onClick={handleStartQueue}>
					Start Queue
				</button>
				<button className='btn btn-danger' onClick={handleStopQueue}>
					Stop Queue
				</button>
			</div>
		</div>
	);
}

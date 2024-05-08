import TextInput from '../test/text-input';
import { QueueRequest } from '../../../../types/queue';
import { Socket } from 'socket.io-client';

type Params = {
	socket: Socket;
	input: string;
	setInput: React.Dispatch<React.SetStateAction<string>>;
	output: string;
	setOutput: React.Dispatch<React.SetStateAction<string>>;
	preset: object;
	setPreset: React.Dispatch<React.SetStateAction<object>>;
};

export default function CreateJob({
	socket,
	input,
	setInput,
	output,
	setOutput,
	preset,
	setPreset,
}: Params) {
	const handlePresetFile = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file && file.type == 'application/json') {
			const reader = new FileReader();
			reader.onload = (event) => {
				const result = event.target?.result?.toString();
				const json = JSON.parse(result!);
				setPreset(json!);
				console.log(`[client] Preset has been updated to '${file.name}'`);
			};
			reader.readAsText(file);
		}
	};

	const handleAddToQueue = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		const data: QueueRequest = {
			input: input,
			output: output,
			preset: preset!,
		};
		socket.emit('add-to-queue', data);
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
			<form>
				<div className='row'>
					<div className='col'>
						<TextInput
							id='input'
							label='Input Path:'
							value={input}
							setValue={setInput}
						/>
					</div>
					<div className='col'>
						<TextInput
							id='output'
							label='Output Path:'
							value={output}
							setValue={setOutput}
						/>
					</div>
				</div>
				<div className='row'>
					<label className='col-2 col-form-label' htmlFor='preset-file'>
						Preset File (JSON):
					</label>
					<div className='col-10'>
						<input
							className='form-control'
							type='file'
							id='preset-file'
							accept='.json'
							onChange={handlePresetFile}
						/>
					</div>
				</div>
			</form>
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

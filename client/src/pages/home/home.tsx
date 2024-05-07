/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import TextInput from '../../components/test/text-input';

export default function Home() {
	const [server, setServer] = useState('http://localhost:9999/client');
	const [input, setInput] = useState('/workspaces/handbrake-server/video/video.mov');
	const [output, setOutput] = useState('/workspaces/handbrake-server/video/video.mkv');
	const [socket] = useState(io(server, { autoConnect: false }));

	// Socket connection & disconnection
	useEffect(() => {
		socket.connect();

		return () => {
			socket.disconnect();
		};
	}, []);

	const handleAddToQueue = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		socket.emit('transcode-job');
	};

	const handleStartQueue = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		socket.emit('start-queue');
	};

	return (
		<div className='container'>
			<h1>HandBrake Web</h1>
			<form
				className='container'
				// onSubmit={(e) => e.preventDefault()}
			>
				<TextInput id='server' label='Server URL:' value={server} setValue={setServer} />
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
			</form>
			<div className='container mt-2 d-flex gap-2'>
				<button className='btn btn-secondary' onClick={handleAddToQueue}>
					Add to Queue
				</button>
				<button className='btn btn-primary' onClick={handleStartQueue}>
					Start Queue
				</button>
			</div>
			{/* {transcodeInfo && <TranscodeInfo transcodeStatus={transcodeInfo} />} */}
		</div>
	);
}

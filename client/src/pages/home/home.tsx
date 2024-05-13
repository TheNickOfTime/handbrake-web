/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { QueueStatus, Queue as QueueType } from '../../../../types/queue';
import { ConnectionIDs } from '../../../../types/socket';
import Queue from '../../components/home/queue';
import ServerInfo from '../../components/home/server-info';
import CreateJob from '../../components/home/create-job';
import { HandbrakePreset } from '../../../../types/preset';

export default function Home() {
	const [server, setServer] = useState('http://localhost:9999/client');
	const [input, setInput] = useState('/workspaces/handbrake-web/video/video.mov');
	const [output, setOutput] = useState('/workspaces/handbrake-web/video/video.mkv');
	const [preset, setPreset] = useState<null | HandbrakePreset>(null);
	const [socket] = useState(io(server, { autoConnect: false }));
	const [queue, setQueue] = useState<QueueType>({});
	const [connections, setConnections] = useState<ConnectionIDs>();
	const [queueStatus, setQueueStatus] = useState<QueueStatus>(QueueStatus.Idle);
	// Socket connection & disconnection
	useEffect(() => {
		socket.connect();

		return () => {
			socket.disconnect();
		};
	}, []);

	const onConnectionsUpdate = (data: ConnectionIDs) => {
		console.log(`[client] Connections have been updated.`);
		console.log(data);
		setConnections(data);
	};

	const onQueueUpdate = (data: QueueType) => {
		console.log(`[client] The queue has been updated.`);
		setQueue(data);
	};

	const onQueueStatusChanged = (status: QueueStatus) => {
		setQueueStatus(status);
	};

	useEffect(() => {
		socket.on('connections-update', onConnectionsUpdate);
		socket.on('queue-update', onQueueUpdate);
		socket.on('queue-status-changed', onQueueStatusChanged);

		return () => {
			socket.off('connections-update', onConnectionsUpdate);
			socket.off('queue-update', onQueueUpdate);
			socket.off('queue-status-changed', onQueueStatusChanged);
		};
	});

	return (
		<div className='container d-flex flex-column gap-4'>
			<h1 className='mt-3 mb-3'>HandBrake Web</h1>
			{/* <FileBrowser socket={socket} onConfirm={setInput} /> */}
			<ServerInfo server={server} setServer={setServer} connections={connections!} />
			<CreateJob
				socket={socket}
				input={input}
				setInput={setInput}
				output={output}
				setOutput={setOutput}
				preset={preset!}
				setPreset={setPreset}
			/>
			<Queue socket={socket} queue={queue} queueStatus={queueStatus} />
		</div>
	);
}

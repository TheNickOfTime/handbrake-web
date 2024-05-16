/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { io } from 'socket.io-client';

import { Queue, QueueStatus } from '../../../../types/queue';
import { PrimaryOutletContextType } from './primary-context';

import SideBar from '../../components/side-bar/side-bar';

import './primary.scss';

export default function Primary() {
	const [server] = useState('http://localhost:9999/client');
	const [socket] = useState(io(server, { autoConnect: false }));
	const [queue, setQueue] = useState<Queue>({});
	const [queueStatus, setQueueStatus] = useState<QueueStatus>(QueueStatus.Idle);
	const [presets, setPresets] = useState<string[]>([]);

	useEffect(() => {
		socket.connect();

		return () => {
			socket.disconnect();
		};
	}, []);

	const onQueueUpdate = (queue: Queue) => {
		console.log(`[client] The queue has been updated.`);
		setQueue(queue);
	};

	const onQueueStatusUpdate = (queueStatus: QueueStatus) => {
		const prevStatus = queueStatus;
		console.log(`[client] The queue status has changed from ${prevStatus} to ${queueStatus}`);
		setQueueStatus(queueStatus);
	};

	const onPresetsUpdate = (presets: string[]) => {
		console.log('[client] Available presets have been updated.');
		setPresets(presets);
	};

	useEffect(() => {
		socket.on('queue-update', onQueueUpdate);
		socket.on('queue-status-update', onQueueStatusUpdate);
		socket.on('presets-update', onPresetsUpdate);

		return () => {
			socket.off('queue-update', onQueueUpdate);
			socket.off('queue-status-update', onQueueStatusUpdate);
			socket.off('presets-update', onPresetsUpdate);
		};
	});

	return (
		<div id='primary'>
			<SideBar />
			<Outlet
				context={{ socket, queue, queueStatus, presets } satisfies PrimaryOutletContextType}
			/>
		</div>
	);
}

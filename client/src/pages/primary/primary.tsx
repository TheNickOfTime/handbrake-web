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

	useEffect(() => {
		socket.connect();

		return () => {
			socket.disconnect();
		};
	}, []);

	const onQueueUpdate = (data: Queue) => {
		console.log(`[client] The queue has been updated.`);
		setQueue(data);
	};

	const onQueueStatusUpdate = (data: QueueStatus) => {
		const prevStatus = queueStatus;
		console.log(`[client] The queue status has changed from ${prevStatus} to ${data}`);
		setQueueStatus(data);
	};

	useEffect(() => {
		socket.on('queue-update', onQueueUpdate);
		socket.on('queue-status-update', onQueueStatusUpdate);

		return () => {
			socket.off('queue-update', onQueueUpdate);
			socket.off('queue-status-update', onQueueStatusUpdate);
		};
	});

	return (
		<div id='primary'>
			<SideBar />
			<Outlet context={{ socket, queue, queueStatus } satisfies PrimaryOutletContextType} />
		</div>
	);
}

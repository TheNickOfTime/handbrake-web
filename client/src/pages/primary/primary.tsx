/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { io } from 'socket.io-client';
// import 'dotenv/config';

import { Queue, QueueStatus } from 'types/queue';
import { ConnectionIDs } from 'types/socket';
import { HandbrakePresetList } from 'types/preset';

import SideBar from 'components/modules/side-bar/side-bar';

import { PrimaryOutletContextType } from './primary-context';
import './primary.scss';
import { Config } from 'types/config';
import NoConnection from 'sections/no-connection/no-connection';
import { WatcherWithRowID } from 'types/watcher';

export default function Primary() {
	const baseURLRegex = /(^https?:\/\/.+\/)(.+$)/;
	const serverURL = (
		import.meta.env.PROD ? window.location.href : 'http://localhost:9999/'
	).replace(baseURLRegex, '$1');

	const serverSocketPath = 'client';
	const server = `${serverURL}${serverSocketPath}`;

	const [socket] = useState(io(server, { autoConnect: false }));
	const [config, setConfig] = useState<Config>();
	const [queue, setQueue] = useState<Queue>({});
	const [queueStatus, setQueueStatus] = useState<QueueStatus>(QueueStatus.Idle);
	const [presets, setPresets] = useState<HandbrakePresetList>({});
	const [connections, setConnections] = useState<ConnectionIDs>({
		clients: [],
		workers: [],
	});
	const [watchers, setWatchers] = useState<WatcherWithRowID[]>([]);
	const [showSidebar, setShowSidebar] = useState(false);

	// Connect to server -------------------------------------------------------
	useEffect(() => {
		console.log(`[client] Connecting to '${server}...'`);
		socket.connect();

		return () => {
			socket.disconnect();
		};
	}, []);

	// Get config --------------------------------------------------------------
	useEffect(() => {
		const getConfig = async () => {
			const newConfig = await socket.emitWithAck('get-config');
			setConfig(newConfig);
		};
		getConfig();
	}, []);

	// Error event listeners ---------------------------------------------------
	const onConnect = () => {
		console.log(`[client] Connection established to '${server}'`);
	};

	const onConnectError = (error: Error) => {
		console.error(`[client] Error has occurred connecting to '${server}':`);
		console.error(error);
	};

	const onDisconnect = (reason: string) => {
		console.log(`[client] Disconnected from '${server}' because ${reason}`);
	};

	useEffect(() => {
		socket.on('connect', onConnect);
		socket.on('connect_error', onConnectError);
		socket.on('disconnect', onDisconnect);

		return () => {
			socket.off('connect', onConnect);
			socket.off('connect_error', onConnectError);
			socket.off('disconnect', onDisconnect);
		};
	});

	// Server event listeners --------------------------------------------------
	const onQueueUpdate = (queue: Queue) => {
		console.log(`[client] The queue has been updated.`);
		setQueue(queue);
	};

	const onQueueStatusUpdate = (queueStatus: QueueStatus) => {
		const prevStatus = queueStatus;
		console.log(`[client] The queue status has changed from ${prevStatus} to ${queueStatus}`);
		setQueueStatus(queueStatus);
	};

	const onPresetsUpdate = (presets: HandbrakePresetList) => {
		console.log('[client] Available presets have been updated.');
		setPresets(presets);
	};

	const onConnectionsUpdate = (data: ConnectionIDs) => {
		console.log(`[client] Connections have been updated.`);
		setConnections(data);
	};

	const onWatchersUpdate = (watchers: WatcherWithRowID[]) => {
		console.log('[client] Watchers have been updated.');
		setWatchers(watchers);
	};

	useEffect(() => {
		socket.on('queue-update', onQueueUpdate);
		socket.on('queue-status-update', onQueueStatusUpdate);
		socket.on('presets-update', onPresetsUpdate);
		socket.on('connections-update', onConnectionsUpdate);
		socket.on('watchers-update', onWatchersUpdate);

		return () => {
			socket.off('queue-update', onQueueUpdate);
			socket.off('queue-status-update', onQueueStatusUpdate);
			socket.off('presets-update', onPresetsUpdate);
			socket.off('connections-update', onConnectionsUpdate);
			socket.off('watchers-update', onWatchersUpdate);
		};
	});

	return (
		<div id='primary'>
			<SideBar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
			<div className={`dark-overlay ${showSidebar ? 'visible' : 'hidden'}`} />
			<div className='primary-section'>
				<div className='mobile-toolbar'>
					<NavLink className='title' to='/'>
						<img src='/handbrake-icon.png' alt='Handbrake Icon' />
						<h1>HandBrake Web</h1>
					</NavLink>
					<button onClick={() => setShowSidebar(!showSidebar)}>
						<i className='bi-list' />
					</button>
				</div>
				<div className='content'>
					{socket.connected && config != undefined ? (
						<Outlet
							context={
								{
									socket,
									queue,
									queueStatus,
									presets,
									connections,
									config,
									watchers,
								} satisfies PrimaryOutletContextType
							}
						/>
					) : (
						<NoConnection url={serverURL} />
					)}
				</div>
			</div>
		</div>
	);
}

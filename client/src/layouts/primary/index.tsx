/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { ConfigType } from 'types/config';
import { HandbrakePresetCategoryType } from 'types/preset';
import { QueueStatus, QueueType } from 'types/queue';
import { ConnectionIDsType } from 'types/socket';
import { WatcherDefinitionObjectType } from 'types/watcher';
import { PrimaryContext } from './context';

import { Link, Outlet } from '@tanstack/react-router';
import SideBar from 'components/modules/side-bar';
import NoConnection from 'sections/no-connection/no-connection';
import './styles.scss';

export default function PrimaryLayout() {
	const baseURLRegex = /(^https?:\/\/.+\/)(.+$)/;
	const serverURL = (
		import.meta.env.PROD ? window.location.href : 'http://localhost:9999/'
	).replace(baseURLRegex, '$1');

	const serverSocketPath = 'client';
	const server = `${serverURL}${serverSocketPath}`;

	const [socket] = useState(io(server, { autoConnect: false }));
	const [config, setConfig] = useState<ConfigType>();
	const [queue, setQueue] = useState<QueueType>({});
	const [queueStatus, setQueueStatus] = useState<QueueStatus>(QueueStatus.Idle);
	const [presets, setPresets] = useState<HandbrakePresetCategoryType>({});
	const [defaultPresets, setDefaultPresets] = useState<HandbrakePresetCategoryType>({});
	const [connections, setConnections] = useState<ConnectionIDsType>({
		clients: [],
		workers: [],
	});
	const [watchers, setWatchers] = useState<WatcherDefinitionObjectType>([]);
	const [showSidebar, setShowSidebar] = useState(false);

	// Connect to server -------------------------------------------------------
	useEffect(() => {
		console.log(`[client] Connecting to '${server}...'`);
		socket.connect();

		return () => {
			socket.disconnect();
		};
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
	const onConfigUpdate = (config: ConfigType) => {
		console.log(`[client] The config has been updated.`);
		setConfig(config);
	};

	const onQueueUpdate = (queue: QueueType) => {
		console.log(`[client] The queue has been updated.`);
		setQueue(queue);
	};

	const onQueueStatusUpdate = (queueStatus: QueueStatus) => {
		const prevStatus = queueStatus;
		console.log(`[client] The queue status has changed from ${prevStatus} to ${queueStatus}`);
		setQueueStatus(queueStatus);
	};

	const onPresetsUpdate = (presets: HandbrakePresetCategoryType) => {
		console.log('[client] Presets have been updated.');
		setPresets(presets);
	};

	const onDefaultPresetsUpdate = (defaultPresets: HandbrakePresetCategoryType) => {
		console.log('[client] Default presets have been updated.');
		setDefaultPresets(defaultPresets);
	};

	const onConnectionsUpdate = (data: ConnectionIDsType) => {
		console.log(`[client] Connections have been updated.`);
		setConnections(data);
	};

	const onWatchersUpdate = (watchers: WatcherDefinitionObjectType) => {
		console.log('[client] Watchers have been updated.');
		setWatchers(watchers);
	};

	useEffect(() => {
		socket.on('config-update', onConfigUpdate);
		socket.on('queue-update', onQueueUpdate);
		socket.on('queue-status-update', onQueueStatusUpdate);
		socket.on('presets-update', onPresetsUpdate);
		socket.on('default-presets-update', onDefaultPresetsUpdate);
		socket.on('connections-update', onConnectionsUpdate);
		socket.on('watchers-update', onWatchersUpdate);

		return () => {
			socket.off('config-update', onConfigUpdate);
			socket.off('queue-update', onQueueUpdate);
			socket.off('queue-status-update', onQueueStatusUpdate);
			socket.off('presets-update', onPresetsUpdate);
			socket.off('default-presets-update', onDefaultPresetsUpdate);
			socket.off('connections-update', onConnectionsUpdate);
			socket.off('watchers-update', onWatchersUpdate);
		};
	});

	return (
		<div id='primary'>
			<SideBar
				showSidebar={showSidebar}
				setShowSidebar={setShowSidebar}
				socket={socket}
				config={config}
			/>
			<div className={`dark-overlay ${showSidebar ? 'visible' : 'hidden'}`} />
			<div className='primary-section'>
				<div className='mobile-toolbar'>
					<Link className='title' to='/'>
						<img src='/handbrake-icon.png' alt='Handbrake Icon' />
						<h1>HandBrake Web</h1>
					</Link>
					<button onClick={() => setShowSidebar(!showSidebar)}>
						<i className='bi-list' />
					</button>
				</div>
				<div className='content'>
					{socket.connected && config != undefined ? (
						<PrimaryContext
							value={{
								serverURL,
								socket,
								queue,
								queueStatus,
								presets,
								defaultPresets,
								connections,
								config,
								watchers,
							}}
						>
							<Outlet />
						</PrimaryContext>
					) : (
						<NoConnection url={serverURL} />
					)}
				</div>
			</div>
		</div>
	);
}

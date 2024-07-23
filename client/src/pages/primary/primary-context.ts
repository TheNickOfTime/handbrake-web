import { Socket } from 'socket.io-client';
import { QueueType, QueueStatus } from 'types/queue';
import { ConnectionIDsType } from 'types/socket';
import { HandbrakePresetListType } from 'types/preset';
import { ConfigType } from 'types/config';
import { WatcherDefinitionWithIDType } from 'types/watcher';

export type PrimaryOutletContextType = {
	socket: Socket;
	queue: QueueType;
	queueStatus: QueueStatus;
	presets: HandbrakePresetListType;
	connections: ConnectionIDsType;
	config: ConfigType;
	watchers: WatcherDefinitionWithIDType[];
};

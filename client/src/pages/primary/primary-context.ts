import { Socket } from 'socket.io-client';
import { QueueType, QueueStatus } from 'types/queue.types';
import { ConnectionIDsType } from 'types/socket.types';
import { HandbrakePresetListType } from 'types/preset.types';
import { ConfigType } from 'types/config.types';
import { WatcherDefinitionWithIDType } from 'types/watcher.types';

export type PrimaryOutletContextType = {
	socket: Socket;
	queue: QueueType;
	queueStatus: QueueStatus;
	presets: HandbrakePresetListType;
	connections: ConnectionIDsType;
	config: ConfigType;
	watchers: WatcherDefinitionWithIDType[];
};

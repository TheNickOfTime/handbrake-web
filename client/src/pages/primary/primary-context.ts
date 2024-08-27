import { Socket } from 'socket.io-client';
import { QueueType, QueueStatus } from 'types/queue';
import { ConnectionIDsType } from 'types/socket';
import { HandbrakePresetCategoryType } from 'types/preset';
import { ConfigType } from 'types/config';
import { WatcherDefinitionObjectType } from 'types/watcher';

export type PrimaryOutletContextType = {
	serverURL: string;
	socket: Socket;
	queue: QueueType;
	queueStatus: QueueStatus;
	presets: HandbrakePresetCategoryType;
	defaultPresets: HandbrakePresetCategoryType;
	connections: ConnectionIDsType;
	config: ConfigType;
	watchers: WatcherDefinitionObjectType;
};

import { createContext } from 'react';
import { Socket } from 'socket.io-client';
import { ConfigType } from 'types/config';
import { HandbrakePresetCategoryType } from 'types/preset';
import { QueueStatus, QueueType } from 'types/queue';
import { ConnectionIDsType } from 'types/socket';
import { WatcherDefinitionObjectType } from 'types/watcher';

export interface PrimaryOutletContextType {
	serverURL: string;
	socket: Socket;
	queue: QueueType;
	queueStatus: QueueStatus;
	presets: HandbrakePresetCategoryType;
	defaultPresets: HandbrakePresetCategoryType;
	connections: ConnectionIDsType;
	config: ConfigType;
	watchers: WatcherDefinitionObjectType;
}

export const PrimaryContext = createContext<PrimaryOutletContextType | null>(null);

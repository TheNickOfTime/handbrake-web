import { ConfigType } from '@handbrake-web/shared/types/config';
import { HandbrakePresetCategoryType } from '@handbrake-web/shared/types/preset';
import { QueueStatus, QueueType } from '@handbrake-web/shared/types/queue';
import { ConnectionIDsType } from '@handbrake-web/shared/types/socket';
import { WatcherDefinitionObjectType } from '@handbrake-web/shared/types/watcher';
import { createContext } from 'react';
import { Socket } from 'socket.io-client';

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

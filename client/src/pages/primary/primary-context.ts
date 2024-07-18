import { Socket } from 'socket.io-client';
import { Queue, QueueStatus } from 'types/queue.types';
import { ConnectionIDs } from 'types/socket.types';
import { HandbrakePresetList } from 'types/preset.types';
import { Config } from 'types/config.types';
import { WatcherWithRowID } from 'types/watcher.types';

export type PrimaryOutletContextType = {
	socket: Socket;
	queue: Queue;
	queueStatus: QueueStatus;
	presets: HandbrakePresetList;
	connections: ConnectionIDs;
	config: Config;
	watchers: WatcherWithRowID[];
};

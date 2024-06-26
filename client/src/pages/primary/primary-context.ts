import { Socket } from 'socket.io-client';
import { Queue, QueueStatus } from 'types/queue';
import { ConnectionIDs } from 'types/socket';
import { HandbrakePresetList } from 'types/preset';
import { Config } from 'types/config';

export type PrimaryOutletContextType = {
	socket: Socket;
	queue: Queue;
	queueStatus: QueueStatus;
	presets: HandbrakePresetList;
	connections: ConnectionIDs;
	config: Config;
};

import { Socket } from 'socket.io-client';
import { Queue, QueueStatus } from '../../../../types/queue';
import { ConnectionIDs } from '../../../../types/socket';
import { HandbrakePreset } from '../../../../types/preset';

export type PrimaryOutletContextType = {
	socket: Socket;
	queue: Queue;
	queueStatus: QueueStatus;
	presets: { [index: string]: HandbrakePreset };
	connections: ConnectionIDs;
};

import { Socket } from 'socket.io-client';
import { Queue, QueueStatus } from '../../../../types/queue';
import { ConnectionIDs } from '../../../../types/socket';

export type PrimaryOutletContextType = {
	socket: Socket;
	queue: Queue;
	queueStatus: QueueStatus;
	presets: string[];
	connections: ConnectionIDs;
};

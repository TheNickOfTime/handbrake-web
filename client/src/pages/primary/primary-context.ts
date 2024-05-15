import { Socket } from 'socket.io-client';
import { Queue, QueueStatus } from '../../../../types/queue';

export type PrimaryOutletContextType = {
	socket: Socket;
	queue: Queue;
	queueStatus: QueueStatus;
};

import { Job, Queue, QueueRequest, QueueStatus } from '../../types/queue';
import { Worker } from '../../types/socket';
import { TranscodeStage } from '../../types/transcode';
import { EmitToAllClients, EmitToAllConnections, connections } from './connections';

export const queue: Queue = [];
export let state: QueueStatus = QueueStatus.Idle;

let workerSearchInterval: null | NodeJS.Timeout = null;
// const availableWorkers: Worker[] = [];
// const busyWorkers: string[] = [];

export function AddJob(data: QueueRequest) {
	const newJob: Job = { ...data, worker: null, status: 'Awaiting Worker' };
	queue.push(newJob);
	// console.log(`[server] Adding '${id} to queue.`);
	console.log(`[server] Queue: ${queue}`);
	EmitToAllClients('queue-update', queue);
}

export function UpdateJob() {}

export function StartQueue(clientID: string) {
	if (state != QueueStatus.Active) {
		state = QueueStatus.Active;

		console.log(`[server] The queue has been started by client '${clientID}'`);

		workerSearchInterval = setInterval(searchForWorker, 1000);
		EmitToAllConnections('queue-status-changed', state);
	}
}

export function StopQueue(clientID?: string) {
	if (state != QueueStatus.Idle) {
		state = QueueStatus.Idle;

		const stoppedBy = clientID ? `client '${clientID}'` : 'the server.';

		console.log(`[server] The queue has been stopped by ${stoppedBy}.`);

		if (workerSearchInterval) {
			clearInterval(workerSearchInterval);
		}
		EmitToAllConnections('queue-status-changed', state);
	}
}

const searchForWorker = () => {
	if (
		queue.length == 0 ||
		queue.every((job) => job.status == TranscodeStage[TranscodeStage.Finished])
	) {
		console.log(`[server] The queue is empty, stopping queue.`);
		StopQueue();
		return;
	}

	console.log(`[server] Searching for a free worker...`);
	const busyWorkers = queue.filter((job) => job.worker != null).map((job) => job.worker);
	const availableWorkers = connections.workers.filter(
		(worker) => !busyWorkers.includes(worker.id)
	);

	if (availableWorkers.length > 0) {
		const selectedJob = queue[0];
		const selectedWorker = availableWorkers[0];
		console.log(`[server] Found free worker '${selectedWorker}'.`);

		selectedJob.worker = selectedWorker.id;
		selectedJob.status = 'Transcoding...';
		queue[0] = selectedJob;

		EmitToAllClients('queue-update', queue);
		selectedWorker.emit('transcode', selectedJob);
	}
};

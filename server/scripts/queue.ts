import { Job, Queue, QueueEntry, QueueRequest, QueueStatus } from '../../types/queue';
import { Worker } from '../../types/socket';
import { TranscodeStage, TranscodeStatusUpdate } from '../../types/transcode';
import { EmitToAllClients, EmitToAllConnections, connections } from './connections';

export const queue: Queue = {};
export let state: QueueStatus = QueueStatus.Idle;

// let maxJobIndex = 0;
let workerSearchInterval: null | NodeJS.Timeout = null;
// const availableWorkers: Worker[] = [];
// const busyWorkers: string[] = [];

export function AddJob(data: QueueRequest) {
	// maxJobIndex += 1;
	const jobID = new Date().getTime();
	console.log(jobID);
	const newJob: Job = {
		...data,
		worker: null,
		status: {
			stage: TranscodeStage.Waiting,
			info: {
				percentage: '0.00 %',
			},
		},
	};
	queue[jobID] = newJob;
	// console.log(`[server] Adding '${id} to queue.`);
	console.log(`[server] Queue: ${queue}`);
	EmitToAllClients('queue-update', queue);
}

export function UpdateJob(data: TranscodeStatusUpdate) {
	queue[data.id].status = data.status;
	// console.log(data.id);
	EmitToAllClients('queue-update', queue);
}

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
		Object.keys(queue).length == 0 ||
		Object.values(queue).every((job) => job.status.stage == TranscodeStage.Finished)
	) {
		console.log(`[server] The queue is empty, stopping queue.`);
		StopQueue();
		return;
	}

	console.log(`[server] Searching for a free worker...`);
	const busyWorkers = Object.values(queue)
		.filter((job) => job.worker != null)
		.map((job) => job.worker);
	const availableWorkers = connections.workers.filter(
		(worker) => !busyWorkers.includes(worker.id)
	);

	if (availableWorkers.length > 0) {
		const selectedJob = Object.keys(queue).map((key) => parseInt(key))[0];
		const selectedWorker = availableWorkers[0];
		console.log(`[server] Found free worker '${selectedWorker}'.`);

		queue[selectedJob].worker = selectedWorker.id;

		EmitToAllClients('queue-update', queue);

		const data: QueueEntry = {
			id: selectedJob,
			job: queue[selectedJob],
		};
		selectedWorker.emit('transcode', data);
	}
};

import { Job, Queue, QueueEntry, QueueRequest, QueueStatus } from '../../types/queue';
import { TranscodeStage, TranscodeStatusUpdate } from '../../types/transcode';
import { EmitToAllClients, EmitToAllConnections, connections } from './connections';
import {
	GetJobFromDatabase,
	GetQueueFromDatabase,
	InsertJobToDatabase,
	RemoveJobFromDatabase,
	UpdateJobInDatabase,
} from './database';
import { GetPresets } from './presets';
import { SearchForWorker } from './worker';
import hash from 'object-hash';

export const queuePath: string = './data/queue.json';

// export let queue: Queue = {};

export let state: QueueStatus = QueueStatus.Stopped;

let workerSearchInterval: null | NodeJS.Timeout = null;

export function GetQueue() {
	return GetQueueFromDatabase();
}

export function UpdateQueue() {
	const updatedQueue = GetQueueFromDatabase();
	if (updatedQueue) {
		// queue = updatedQueue;
		EmitToAllClients('queue-update', updatedQueue);
	}
}

export function AddJob(data: QueueRequest) {
	const jobID =
		new Date().getTime().toString() +
		hash(data) +
		(Math.random() * 9999).toString().padStart(4);
	const newJob: Job = {
		input: data.input,
		output: data.output,
		preset: GetPresets()[data.preset],
		worker: null,
		status: {
			stage: TranscodeStage.Waiting,
			info: {
				percentage: '0.00 %',
			},
		},
	};

	InsertJobToDatabase(jobID.toString(), newJob);
	UpdateQueue();
}

export function UpdateJob(data: TranscodeStatusUpdate) {
	const job = GetJobFromDatabase(data.id);
	if (job) {
		job.status = data.status;
		if (job.status.stage == TranscodeStage.Finished) {
			job.worker = null;
		}
		UpdateJobInDatabase(data.id.toString(), job);
		UpdateQueue();
	}
}

export function GetQueueStatus() {
	return state;
}

export function SetQueueStatus(newState: QueueStatus) {
	state = newState;
	EmitToAllClients('queue-status-update', state);
}

export function StartQueue(clientID: string) {
	if (state == QueueStatus.Stopped) {
		SetQueueStatus(QueueStatus.Active);

		console.log(`[server] The queue has been started by client '${clientID}'`);

		workerSearchInterval = setInterval(SearchForWorker, 1000);
	}
}

export function StopQueue(clientID?: string) {
	if (state != QueueStatus.Stopped) {
		SetQueueStatus(QueueStatus.Stopped);

		const stoppedBy = clientID ? `client '${clientID}'` : 'the server.';

		console.log(`[server] The queue has been stopped by ${stoppedBy}.`);

		if (workerSearchInterval) {
			clearInterval(workerSearchInterval);
		}
		EmitToAllConnections('queue-status-changed', state);
	}
}

export function ClearQueue(clientID: string, finishedOnly: boolean = false) {
	console.log(
		`[server] [queue] Client '${clientID}' has requested to clear ${
			finishedOnly ? 'finished' : 'all'
		} jobs from the queue.`
	);
	const queue = GetQueueFromDatabase();
	if (queue) {
		for (const key of Object.keys(queue)) {
			const job: Job = queue[key];

			switch (job.status.stage) {
				case TranscodeStage.Waiting:
					if (!finishedOnly) {
						RemoveJobFromDatabase(key);
						console.log(
							`[server] Removing job '${key}' from the queue due to being 'Waiting'.`
						);
					}
					break;
				case TranscodeStage.Finished:
					RemoveJobFromDatabase(key);
					console.log(
						`[server] Removing job '${key}' from the queue due to being 'Finished'.`
					);
					break;
			}
		}

		UpdateQueue();
	}
}

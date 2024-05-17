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

export const queuePath: string = './data/queue.json';

// export let queue: Queue = {};

export let state: QueueStatus = QueueStatus.Idle;

let workerSearchInterval: null | NodeJS.Timeout = null;

export async function GetQueue() {
	return await GetQueueFromDatabase();
}

export async function UpdateQueue() {
	const updatedQueue = await GetQueueFromDatabase();
	if (updatedQueue) {
		// queue = updatedQueue;
		EmitToAllClients('queue-update', updatedQueue);
	}
}

export async function AddJob(data: QueueRequest) {
	const jobID = new Date().getTime();
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

	await InsertJobToDatabase(jobID.toString(), newJob);
	await UpdateQueue();
}

export async function UpdateJob(data: TranscodeStatusUpdate) {
	const job = await GetJobFromDatabase(data.id);
	if (job) {
		job.status = data.status;
		if (job.status.stage == TranscodeStage.Finished) {
			job.worker = null;
		}
		await UpdateJobInDatabase(data.id.toString(), job);
		await UpdateQueue();
	}
}

export function StartQueue(clientID: string) {
	if (state != QueueStatus.Active) {
		state = QueueStatus.Active;

		console.log(`[server] The queue has been started by client '${clientID}'`);

		workerSearchInterval = setInterval(SearchForWorker, 1000);
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

export async function ClearQueue(clientID: string, finishedOnly: boolean = false) {
	console.log(
		`[server] [queue] Client '${clientID}' has requested to clear ${
			finishedOnly ? 'finished' : 'all'
		} jobs from the queue.`
	);
	const queue = await GetQueueFromDatabase();
	if (queue) {
		for await (const key of Object.keys(queue)) {
			const job: Job = queue[key];

			switch (job.status.stage) {
				case TranscodeStage.Waiting:
					if (!finishedOnly) {
						await RemoveJobFromDatabase(key);
						console.log(
							`[server] Removing job '${key}' from the queue due to being 'Waiting'.`
						);
					}
					break;
				case TranscodeStage.Finished:
					await RemoveJobFromDatabase(key);
					console.log(
						`[server] Removing job '${key}' from the queue due to being 'Finished'.`
					);
					break;
			}
		}

		UpdateQueue();
	}
}

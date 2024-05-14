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

export async function ClearQueue(clientID: string, finishedOnly: boolean = false) {
	console.log(
		`[server] [queue] Client '${clientID}' has requested to clear ${
			finishedOnly ? 'finished' : 'all'
		} jobs from the queue.`
	);
	const queue = await GetQueueFromDatabase();
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

const searchForWorker = async () => {
	const queue = await GetQueueFromDatabase();
	if (queue) {
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
			const validJobs = Object.keys(queue).filter(
				(key) => queue[key].status.stage == TranscodeStage.Waiting
			);
			const selectedJobID = validJobs[0];
			const selectedWorker = availableWorkers[0];
			console.log(`[server] Found free worker '${selectedWorker}'.`);

			const selectedJob = queue[selectedJobID];
			selectedJob.worker = selectedWorker.id;
			UpdateJobInDatabase(selectedJobID, selectedJob);

			// EmitToAllClients('queue-update', queue);

			const data: QueueEntry = {
				id: selectedJobID,
				job: selectedJob,
			};
			selectedWorker.emit('transcode', data);
		}
	}
};

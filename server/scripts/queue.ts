import { Job, Queue, QueueEntry, QueueRequest, QueueStatus } from '../../types/queue';
import { TranscodeStage, TranscodeStatusUpdate } from '../../types/transcode';
import {
	EmitToAllClients,
	EmitToAllConnections,
	EmitToWorkerWithID,
	GetWorkerWithID,
} from './connections';
import {
	GetJobFromDatabase,
	GetQueueFromDatabase,
	InsertJobToDatabase,
	RemoveJobFromDatabase,
	UpdateJobInDatabase,
} from './database/database-queue';
import { GetStatusFromDatabase, UpdateStatusInDatabase } from './database/database-status';
import { GetPresets } from './presets';
import { SearchForWorker } from './worker';
import hash from 'object-hash';

let workerSearchInterval: null | NodeJS.Timeout = null;

// Init --------------------------------------------------------------------------------------------
export function InitializeQueue() {
	// Queue Status
	const status = GetQueueStatus();
	if (status) {
		console.log(
			`[server] [queue] Existing queue status '${QueueStatus[status]}' retreived from the database.`
		);
		EmitToAllClients('queue-status-update', status);
	} else {
		SetQueueStatus(QueueStatus.Stopped);
		console.error(
			`[server] [queue] The queue status does not exist in the database, initializing to the state 'stopped'.`
		);
	}

	// Queue Data
	const queue = GetQueueFromDatabase();
	if (queue) {
		Object.keys(queue).forEach((jobID) => {
			const job = queue[jobID];
			if (
				job.worker != null ||
				job.status.stage == TranscodeStage.Scanning ||
				job.status.stage == TranscodeStage.Transcoding
			) {
				job.worker = null;
				job.status.stage = TranscodeStage.Stopped;
				job.status.info = {
					percentage: '0.00%',
				};

				UpdateJobInDatabase(jobID, job);
				console.log(
					`[server] [queue] Job '${jobID}' was loaded from the database in an unfinished state. The job will be updated to 'Stopped'.`
				);
			}
		});
		EmitToAllClients('queue-update', queue);
	}
}

// Status ------------------------------------------------------------------------------------------
export function GetQueueStatus() {
	const status = GetStatusFromDatabase('queue')?.state as QueueStatus;
	return status;
}

export function SetQueueStatus(newState: QueueStatus) {
	UpdateStatusInDatabase('queue', newState);
	EmitToAllClients('queue-status-update', newState);
}

export function StartQueue(clientID: string) {
	if (GetQueueStatus() == QueueStatus.Stopped) {
		const newStatus = QueueStatus.Active;
		SetQueueStatus(newStatus);

		console.log(`[server] The queue has been started by client '${clientID}'`);

		workerSearchInterval = setInterval(SearchForWorker, 1000);
	}
}

export function StopQueue(clientID?: string) {
	if (GetQueueStatus() != QueueStatus.Stopped) {
		const newStatus = QueueStatus.Stopped;
		SetQueueStatus(newStatus);

		const stoppedBy = clientID ? `client '${clientID}'` : 'the server.';

		console.log(`[server] The queue has been stopped by ${stoppedBy}.`);

		if (workerSearchInterval) {
			clearInterval(workerSearchInterval);
		}
		EmitToAllConnections('queue-status-changed', newStatus);
	}
}

// Queue -------------------------------------------------------------------------------------------
export function GetQueue() {
	return GetQueueFromDatabase();
}

export function UpdateQueue() {
	const updatedQueue = GetQueueFromDatabase();
	if (updatedQueue) {
		EmitToAllClients('queue-update', updatedQueue);
	}
}

// Job Actions -------------------------------------------------------------------------------------
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
		switch (data.status.stage) {
			case TranscodeStage.Waiting:
				if (job.status.stage != TranscodeStage.Waiting) {
					job.worker = null;
				}
				break;
			case TranscodeStage.Finished:
				job.worker = null;
				break;
			case TranscodeStage.Stopped:
				job.worker = null;
				break;
		}
		job.status = data.status;
		UpdateJobInDatabase(data.id.toString(), job);
		UpdateQueue();
	}
}

export function StopJob(id: string) {
	const job = GetJobFromDatabase(id);
	if (job) {
		// Tell the worker to stop transcoding
		const worker = job.worker;
		if (worker) {
			if (GetWorkerWithID(worker)) {
				EmitToWorkerWithID(worker, 'stop-transcode', id);
			} else {
				console.log('poop');
			}
		}

		// Update Job in database
		job.worker = null;
		job.status.stage = TranscodeStage.Stopped;
		job.status.info = {
			percentage: '0.00 %',
		};

		UpdateJobInDatabase(id, job);
		UpdateQueue();
	} else {
		console.error(
			`[server] Job with id '${id}' does not exist, unable to stop the requested job.`
		);
	}
}

export function ResetJob(id: string) {
	const job = GetJobFromDatabase(id);
	if (job) {
		if (job.status.stage == TranscodeStage.Stopped) {
			// Update Job in database
			job.worker = null;
			job.status.stage = TranscodeStage.Waiting;
			job.status.info = {
				percentage: '0.00 %',
			};

			UpdateJobInDatabase(id, job);
			UpdateQueue();
		} else {
			console.error(
				`[server] [error] Job with id '${id}' cannot be reset because it is not in a stopped state.`
			);
		}
	} else {
		console.error(
			`[server] Job with id '${id}' does not exist, unable to reset the requested job.`
		);
	}
}

export function RemoveJob(id: string) {
	const job = GetJobFromDatabase(id);
	if (job) {
		RemoveJobFromDatabase(id);
		UpdateQueue();
	} else {
		console.error(
			`[server] Job with id '${id}' does not exist, unable to remove the requested job.`
		);
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
				case TranscodeStage.Stopped:
					if (!finishedOnly) {
						RemoveJobFromDatabase(key);
						console.log(
							`[server] Removing job '${key}' from the queue due to being 'Stopped'.`
						);
					}
			}
		}

		UpdateQueue();
	}
}

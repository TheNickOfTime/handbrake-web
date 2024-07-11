import hash from 'object-hash';
import { Job, QueueEntry, QueueRequest, QueueStatus } from 'types/queue';
import { Worker } from 'types/socket';
import { TranscodeStage, TranscodeStatusUpdate } from 'types/transcode';
import {
	EmitToAllClients,
	EmitToWorkerWithID,
	GetWorkerID,
	GetWorkerWithID,
	GetWorkers,
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

export function GetBusyWorkers() {
	const busyWorkers = GetWorkers().filter((worker) => {
		return Object.values(GetQueue())
			.filter((job) => job.worker != null)
			.map((job) => job.worker)
			.includes(GetWorkerID(worker));
	});
	return busyWorkers;
}

export function GetAvailableWorkers() {
	const availableWorkers = GetWorkers().filter((worker) => {
		return !Object.values(GetQueue())
			.filter((job) => job.worker != null)
			.map((job) => job.worker)
			.includes(GetWorkerID(worker));
	});
	return availableWorkers;
}

export function GetAvailableJobs() {
	const queue = GetQueue();
	const availableJobs = Object.keys(queue).filter(
		(key) => queue[key].status.stage == TranscodeStage.Waiting
	);
	return availableJobs;
}

export function JobForAvailableWorkers(jobID: string) {
	if (GetQueueStatus() != QueueStatus.Stopped) {
		console.log(
			`[server] [queue] Job with ID '${jobID}' is available, checking for available workers...`
		);
		const availableWorkers = GetAvailableWorkers();
		if (availableWorkers.length > 0) {
			const selectedWorker = availableWorkers[0];
			const job = GetJobFromDatabase(jobID);
			if (job) {
				StartJob(jobID, job, selectedWorker);
				if (GetQueueStatus() != QueueStatus.Active) {
					SetQueueStatus(QueueStatus.Active);
				}
				console.log(
					`[server] [queue] Found worker with ID '${GetWorkerID(
						selectedWorker
					)}' for job with ID '${jobID}`
				);
			}
		} else {
			console.log(
				`[server] [queue] There are no workers available for job with ID '${jobID}'.`
			);
		}
	}
}

export function WorkerForAvailableJobs(workerID: string) {
	if (GetQueueStatus() != QueueStatus.Stopped) {
		console.log(
			`[server] [queue] Worker with ID '${workerID}' is available, checking for available jobs...`
		);
		const availableJobs = GetAvailableJobs();
		if (availableJobs.length > 0) {
			const worker = GetWorkerWithID(workerID);
			const selectedJobID = availableJobs[0];
			const selectedJob = GetJobFromDatabase(selectedJobID);
			if (selectedJob && worker) {
				StartJob(selectedJobID, selectedJob, worker);
				if (GetQueueStatus() != QueueStatus.Active) {
					SetQueueStatus(QueueStatus.Active);
				}
				console.log(
					`[server] [queue] Found job with ID '${selectedJobID}' for worker with ID '${workerID}'.`
				);
			}
		} else {
			console.log(
				`[server] [queue] There are no jobs available for worker with ID '${workerID}'.`
			);
			// Set queue to idle if there are no other busy workers
			if (GetBusyWorkers().length == 0) {
				SetQueueStatus(QueueStatus.Idle);
				console.log("There are no active workers, setting queue to 'Idle'.");
			}
		}
	}
}

export function StartJob(jobID: string, job: Job, worker: Worker) {
	const workerID = GetWorkerID(worker);
	job.worker = workerID;
	job.time = {
		started: new Date().getTime(),
	};
	UpdateJobInDatabase(jobID, job);
	const newJob: QueueEntry = {
		id: jobID,
		job: job,
	};
	worker.emit('transcode', newJob);
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
		try {
			const availableWorkers = GetAvailableWorkers();
			const availableJobs = GetAvailableJobs();
			const moreJobs = availableWorkers.length < availableJobs.length;
			const maxConcurrent = moreJobs ? availableWorkers.length : availableJobs.length;
			console.log(
				`[server] [queue] There are more ${moreJobs ? 'jobs' : 'workers'} than ${
					moreJobs ? 'workers' : 'jobs'
				}, the max amount of concurrent jobs is ${maxConcurrent} job(s).`
			);

			if (maxConcurrent > 0) {
				for (let i = 0; i < maxConcurrent; i++) {
					const [selectedJobID, selectedJob] = Object.entries(GetQueue())[i];
					const selectedWorker = availableWorkers[i];
					const selectedWorkerID = GetWorkerID(selectedWorker);

					// Update Job
					selectedJob.worker = selectedWorkerID;
					UpdateJobInDatabase(selectedJobID, selectedJob);

					//Send job to worker
					const data: QueueEntry = {
						id: selectedJobID,
						job: selectedJob,
					};
					selectedWorker.emit('transcode', data);

					console.log(
						`[server] [queue] Assigning worker '${selectedWorkerID}' to job '${selectedJobID}'.`
					);
				}
				SetQueueStatus(QueueStatus.Active);
			} else {
				console.log(
					`[server] [queue] Setting the queue to idle because there are no ${
						moreJobs ? 'workers' : 'jobs'
					} available for ${moreJobs ? 'jobs' : 'workers'}.`
				);
				SetQueueStatus(QueueStatus.Idle);
			}
		} catch (err) {
			console.error(err);
		}
	}
}

export function StopQueue(clientID?: string) {
	if (GetQueueStatus() != QueueStatus.Stopped) {
		const newStatus = QueueStatus.Stopped;
		SetQueueStatus(newStatus);

		const stoppedBy = clientID ? `client '${clientID}'` : 'the server.';

		console.log(`[server] The queue has been stopped by ${stoppedBy}.`);
	}
}

// Queue -------------------------------------------------------------------------------------------
export function GetQueue() {
	const queue = GetQueueFromDatabase();
	if (queue) {
		return queue;
	} else {
		throw new Error('Could not get the queue from the database.');
	}
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
		time: {},
	};

	InsertJobToDatabase(jobID, newJob);
	UpdateQueue();
	JobForAvailableWorkers(jobID);
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
				job.time.finished = new Date().getTime();
				break;
			case TranscodeStage.Stopped:
				job.worker = null;
				job.time = {};
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
			JobForAvailableWorkers(id);
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

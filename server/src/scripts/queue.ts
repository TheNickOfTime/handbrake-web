import { QueueStartupBehavior } from '@handbrake-web/shared/types/config';
import type { AddJobType, DetailedJobType } from '@handbrake-web/shared/types/database';
import { QueueStatus } from '@handbrake-web/shared/types/queue';
import { TranscodeStage } from '@handbrake-web/shared/types/transcode';
import { error } from 'console';
import logger, { RemoveJobLogByID } from 'logging';
import { Socket as Worker } from 'socket.io';
import { GetConfig } from './config/config';
import {
	EmitToAllClients,
	EmitToWorkerWithID,
	GetWorkerID,
	GetWorkerWithID,
	GetWorkers,
} from './connections';
import {
	DatabaseGetDetailedJobByID,
	DatabaseGetDetailedJobs,
	DatabaseInsertJob,
	DatabaseInsertJobOrderByID,
	DatabaseRemoveJobByID,
	DatabaseUpdateJobOrderIndex,
	DatabaseUpdateJobStatus,
} from './database/database-queue';
import { DatabaseSelectStatusByID, DatabaseUpdateStatus } from './database/database-status';

// Init --------------------------------------------------------------------------------------------
export async function InitializeQueue() {
	// Queue Status
	switch (GetConfig().application['queue-startup-behavior']) {
		case QueueStartupBehavior.Active:
			logger.info(`[server] [queue] Initializating the queue state to 'Active'.`);
			SetQueueStatus(QueueStatus.Idle);
			break;
		case QueueStartupBehavior.Stopped:
			logger.info(`[server] [queue] Initializating the queue state to 'Stopped'.`);
			SetQueueStatus(QueueStatus.Stopped);
			break;
		case QueueStartupBehavior.Previous:
		default:
			const status = await GetQueueStatus();
			if (status != null || status != undefined) {
				logger.info(
					`[server] [queue] Existing queue status '${QueueStatus[status]}' retreived from the database.`
				);
				EmitToAllClients('queue-status-update', status);
			} else {
				SetQueueStatus(QueueStatus.Stopped);
				logger.error(
					`[server] [queue] The queue status does not exist in the database, initializing to the state 'stopped'.`
				);
			}
			break;
	}

	// Queue Data
	const queue = await DatabaseGetDetailedJobs();
	queue.forEach((job) => {
		if (
			job.worker_id != null ||
			job.transcode_stage == TranscodeStage.Scanning ||
			job.transcode_stage == TranscodeStage.Transcoding
		) {
			DatabaseUpdateJobStatus(job.job_id, { transcode_stage: TranscodeStage.Unknown });

			logger.info(
				`[server] [queue] Job '${job.job_id}' was loaded from the database in an unfinished state. The job's state will be updated to 'Unknown'.`
			);
		}
	});
	EmitToAllClients('queue-update', queue);
}

export async function GetBusyWorkers() {
	const busyWorkers = [...new Set((await GetQueue()).map((job) => job.worker_id))].filter(
		(value) => value != null
	);

	return busyWorkers;
}

export async function GetAvailableWorkers() {
	const busyWorkers = await GetBusyWorkers();

	const availableWorkers = GetWorkers().filter((worker) => {
		const workerID = GetWorkerID(worker);

		return !busyWorkers.includes(workerID);
	});
	return availableWorkers;
}

export async function GetAvailableJobs() {
	const queue = await DatabaseGetDetailedJobs();
	const availableJobs = queue
		.filter((job) => job.transcode_stage == TranscodeStage.Waiting)
		.sort((jobA, jobB) => jobA.order_index - jobB.order_index);
	return availableJobs;
}

export async function JobForAvailableWorkers(jobID: number) {
	if ((await GetQueueStatus()) != QueueStatus.Stopped) {
		logger.info(
			`[server] [queue] Job with ID '${jobID}' is available, checking for available workers...`
		);
		const availableWorkers = await GetAvailableWorkers();
		if (availableWorkers.length > 0) {
			const selectedWorker = availableWorkers[0];
			const job = await DatabaseGetDetailedJobByID(jobID);
			await StartJob(job, selectedWorker);
			if ((await GetQueueStatus()) != QueueStatus.Active) {
				SetQueueStatus(QueueStatus.Active);
			}
			logger.info(
				`[server] [queue] Found worker with ID '${GetWorkerID(
					selectedWorker
				)}' for job with ID '${jobID}'.`
			);
		} else {
			logger.info(
				`[server] [queue] There are no workers available for job with ID '${jobID}'.`
			);
		}
	}
}

export async function WorkerForAvailableJobs(workerID: string) {
	if ((await GetQueueStatus()) != QueueStatus.Stopped) {
		logger.info(
			`[server] [queue] Worker with ID '${workerID}' is available, checking for available jobs...`
		);
		const availableJobs = await GetAvailableJobs();
		if (availableJobs.length > 0) {
			const worker = GetWorkerWithID(workerID);
			const selectedJob = availableJobs[0];
			if (selectedJob && worker) {
				StartJob(selectedJob, worker);
				if ((await GetQueueStatus()) != QueueStatus.Active) {
					SetQueueStatus(QueueStatus.Active);
				}
				logger.info(
					`[server] [queue] Found job with ID '${selectedJob.job_id}' for worker with ID '${workerID}'.`
				);
			}
		} else {
			logger.info(
				`[server] [queue] There are no jobs available for worker with ID '${workerID}'.`
			);
			// Set queue to idle if there are no other busy workers
			if ((await GetBusyWorkers()).length == 0) {
				SetQueueStatus(QueueStatus.Idle);
				logger.info("[queue] There are no active workers, setting queue to 'Idle'.");
			}
		}
	}
}

// Status ------------------------------------------------------------------------------------------
export async function GetQueueStatus() {
	const status = await DatabaseSelectStatusByID('queue');
	return status;
}

export function SetQueueStatus(newState: QueueStatus) {
	DatabaseUpdateStatus('queue', newState);
	EmitToAllClients('queue-status-update', newState);
}

export async function StartQueue(clientID?: string) {
	const status = await GetQueueStatus();
	if (status == QueueStatus.Stopped) {
		try {
			const availableWorkers = await GetAvailableWorkers();
			const availableJobs = await GetAvailableJobs();
			const moreJobs = availableWorkers.length < availableJobs.length;
			const maxConcurrent = moreJobs ? availableWorkers.length : availableJobs.length;
			logger.info(
				`[server] [queue] There are more ${moreJobs ? 'jobs' : 'workers'} than ${
					moreJobs ? 'workers' : 'jobs'
				}, the max amount of concurrent jobs is ${maxConcurrent} job(s).`
			);

			if (maxConcurrent > 0) {
				for (let i = 0; i < maxConcurrent; i++) {
					const selectedJob = availableJobs[i];
					const selectedWorker = availableWorkers[i];
					const selectedWorkerID = GetWorkerID(selectedWorker);

					if (selectedJob) {
						StartJob(selectedJob, selectedWorker);

						logger.info(
							`[server] [queue] Assigning worker '${selectedWorkerID}' to job '${selectedJob}'.`
						);
					} else {
						throw new Error(
							`[server] [queue] Cannot find job with ID '${selectedJob}' in the database.`
						);
					}
				}
				SetQueueStatus(QueueStatus.Active);
			} else {
				logger.info(
					`[server] [queue] Setting the queue to idle because there are no ${
						moreJobs ? 'workers' : 'jobs'
					} available for ${moreJobs ? 'jobs' : 'workers'}.`
				);
				SetQueueStatus(QueueStatus.Idle);
			}
		} catch (err) {
			logger.error(err);
		}
	}
}

export async function StopQueue(clientID?: string) {
	if ((await GetQueueStatus()) != QueueStatus.Stopped) {
		const newStatus = QueueStatus.Stopped;
		SetQueueStatus(newStatus);

		const stoppedBy = clientID ? `client '${clientID}'` : 'the server.';

		logger.info(`[server] The queue has been stopped by ${stoppedBy}.`);
	}
}

// Queue -------------------------------------------------------------------------------------------
export async function GetQueue() {
	const queue: DetailedJobType[] = await DatabaseGetDetailedJobs();
	return queue;
}

export async function UpdateQueue() {
	const updatedQueue = await DatabaseGetDetailedJobs();
	if (updatedQueue) {
		EmitToAllClients('queue-update', updatedQueue);
	}
}

// Job Actions -------------------------------------------------------------------------------------
export async function AddJob(data: AddJobType) {
	const job = await DatabaseInsertJob(data);
	if (job) {
		await UpdateQueue();
		await JobForAvailableWorkers(job);
	}
}

export async function StartJob(job: DetailedJobType, worker: Worker) {
	const workerID = GetWorkerID(worker);

	const returnedJobID: number = await worker.emitWithAck('start-transcode', job.job_id);
	if (returnedJobID == job.job_id) {
		logger.info(`[queue] Worker '${workerID}' has started work on job '${job.job_id}'.`);
		await DatabaseUpdateJobStatus(job.job_id, {
			worker_id: workerID,
			time_started: new Date().getTime(),
		});
	} else {
		logger.warn(
			`[queue] [warn] Worker '${workerID}' is busy with another job and cannot start work on job '${job.job_id}'. Checking for available workers again...`
		);
		await JobForAvailableWorkers(job.job_id);
	}
}

export async function StopJob(job_id: number, isError: boolean = false) {
	try {
		const job = await DatabaseGetDetailedJobByID(job_id);

		// Tell the worker to stop transcoding
		const worker = job.worker_id;
		if (worker) {
			if (GetWorkerWithID(worker)) {
				EmitToWorkerWithID(worker, 'stop-transcode', job_id);
			}
		}

		const newStage = isError ? TranscodeStage.Error : TranscodeStage.Stopped;

		// Update Job in database
		await DatabaseUpdateJobOrderIndex(job_id, 0);
		await DatabaseUpdateJobStatus(job_id, {
			worker_id: null,
			transcode_stage: newStage,
			transcode_percentage: 0,
			transcode_eta: 0,
			transcode_fps_current: 0,
			transcode_fps_average: 0,
			time_started: 0,
			time_finished: Date.now(),
		});
		await UpdateQueue();
		if (worker) {
			WorkerForAvailableJobs(worker);
		}
	} catch (err) {
		logger.error(`Could not stop the job with id '${job_id}'.`);
		throw err;
	}
}

export async function ResetJob(job_id: number) {
	const job = await DatabaseGetDetailedJobByID(job_id);

	if (
		job.transcode_stage == TranscodeStage.Stopped ||
		job.transcode_stage == TranscodeStage.Finished
	) {
		// Update Job in database
		await DatabaseInsertJobOrderByID(job_id);
		await DatabaseUpdateJobStatus(job_id, {
			worker_id: null,
			transcode_stage: TranscodeStage.Waiting,
			transcode_percentage: 0,
			transcode_eta: 0,
			transcode_fps_current: 0,
			transcode_fps_average: 0,
			time_started: 0,
			time_finished: 0,
		});

		await UpdateQueue();
		await JobForAvailableWorkers(job_id);
	} else {
		logger.error(
			`[server] [error] Job with id '${job_id}' cannot be reset because it is not in a stopped/finished state.`
		);
		throw error;
	}
}

export async function RemoveJob(job_id: number) {
	await DatabaseRemoveJobByID(job_id);
	await RemoveJobLogByID(job_id);
	await UpdateQueue();
}

export async function ClearQueue(clientID: string, finishedOnly: boolean = false) {
	logger.info(
		`[server] [queue] Client '${clientID}' has requested to clear ${
			finishedOnly ? 'finished' : 'all'
		} jobs from the queue.`
	);
	const queue = await DatabaseGetDetailedJobs();
	for await (const job of queue) {
		switch (job.transcode_stage) {
			case TranscodeStage.Waiting:
				if (!finishedOnly) {
					await DatabaseRemoveJobByID(job.job_id);
					logger.info(
						`[server] Removing job '${job.job_id}' from the queue due to being 'Waiting'.`
					);
				}
				break;
			case TranscodeStage.Finished:
				await DatabaseRemoveJobByID(job.job_id);
				logger.info(
					`[server] Removing job '${job.job_id}' from the queue due to being 'Finished'.`
				);
				break;
			case TranscodeStage.Stopped:
				if (!finishedOnly) {
					await DatabaseRemoveJobByID(job.job_id);
					logger.info(
						`[server] Removing job '${job.job_id}' from the queue due to being 'Stopped'.`
					);
				}
		}
	}

	await UpdateQueue();
}

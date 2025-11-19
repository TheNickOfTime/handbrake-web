import type { JobStatusType, JobType } from '@handbrake-web/shared/types/database';
import { type HandbrakePresetType } from '@handbrake-web/shared/types/preset';
import { QueueStatus } from '@handbrake-web/shared/types/queue';
import { TranscodeStage } from '@handbrake-web/shared/types/transcode';
import type { WorkerProperties } from '@handbrake-web/shared/types/worker';
import logger, { logPath, WriteWorkerLogToFile } from 'logging';
import { AddWorker, RemoveWorker } from 'scripts/connections';
import {
	DatabaseGetJobStatusByID,
	DatabaseGetSimpleJobByID,
	DatabaseUpdateJobOrderIndex,
	DatabaseUpdateJobStatus,
} from 'scripts/database/database-queue';
import { GetDefaultPresetByName, GetPresetByName } from 'scripts/presets';
import { AddWorkerProperties } from 'scripts/properties';
import {
	GetBusyWorkers,
	GetQueue,
	SetQueueStatus,
	StopJob,
	UpdateQueue,
	WorkerForAvailableJobs,
} from 'scripts/queue';
import { Server } from 'socket.io';

export default function WorkerSocket(io: Server) {
	io.of('/worker').on('connection', async (socket) => {
		const workerID = socket.handshake.query['workerID'] as string;

		logger.info(`[socket] Worker '${workerID}' has connected with ID '${socket.id}'.`);
		AddWorker(socket);

		logger.info(`[socket] Getting worker '${workerID}' properties...`);
		const properties: WorkerProperties = await socket.emitWithAck('get-properties');
		AddWorkerProperties(workerID, properties);
		logger.info(`[socket] Worker properties = ${JSON.stringify(properties, null, 2)}`);

		logger.info(`[socket] Checking worker '${workerID}' for an existing job in progress...`);
		const existingJobID = await socket.emitWithAck('check-for-existing-job');
		if (existingJobID) {
			logger.info(`[socket] Worker '${workerID}' is busy with job '${existingJobID}'.`);

			const workerJob = await DatabaseGetJobStatusByID(existingJobID);
			if (
				workerJob.worker_id != workerID ||
				(workerJob.transcode_stage != TranscodeStage.Scanning &&
					workerJob.transcode_stage != TranscodeStage.Transcoding)
			) {
				logger.warn(
					`[socket] [warn] The server's information about job '${workerJob.job_id}' is out of date. Setting the job's worker and to the state 'Unknown' until we hear back from the worker again.`
				);
				await DatabaseUpdateJobStatus(existingJobID, {
					worker_id: workerID,
					transcode_stage: TranscodeStage.Unknown,
				});
			}
		} else {
			logger.info(`[socket] Worker '${workerID}' is not busy with an existing job.`);
			WorkerForAvailableJobs(workerID);
		}

		socket.on('disconnect', async (reason, details) => {
			logger.info(
				`[socket] Worker '${workerID}' with ID '${socket.id}' has disconnected with reason '${reason}'.`
			);
			RemoveWorker(socket);
			const queue = await GetQueue();
			const workersJob = queue.find((job) => job.worker_id == workerID);
			if (workersJob) {
				// StopJob(workersJob.job_id);
				// logger.info(
				// 	`[socket] Disconnected worker '${workerID}' was working on job '${workersJob.job_id}' when disconnected - setting job to stopped.`
				// );
				logger.info(
					`[socket] Disconnected worker '${workerID}' was working on job '${workersJob.job_id}' when disconnected - setting job to 'unknown'.`
				);
				DatabaseUpdateJobStatus(workersJob.job_id, {
					transcode_stage: TranscodeStage.Unknown,
				});
			}
		});

		socket.on(
			'get-job-data',
			async (jobID: number, callback: (jobData: JobType | undefined) => void) => {
				const jobData = await DatabaseGetSimpleJobByID(jobID);
				callback(jobData);
			}
		);

		socket.on(
			'get-preset-data',
			(
				presetCategory: string,
				presetID: string,
				callback: (presetData: HandbrakePresetType | undefined) => void
			) => {
				const isDefaultPreset = presetCategory.match(/^Default:\s/);
				const jobData = isDefaultPreset
					? GetDefaultPresetByName(presetCategory.replace(/Default:\s/, ''), presetID)
					: GetPresetByName(presetCategory, presetID);
				callback(jobData);
			}
		);

		socket.on('transcode-stopped', async (job_id: number, callback: () => void) => {
			logger.info(
				`[socket] Worker '${workerID}' with ID '${socket.id}' has stopped transcoding.`
			);

			// await StopJob(job_id);
			await DatabaseUpdateJobOrderIndex(job_id, 0);
			await DatabaseUpdateJobStatus(job_id, {
				worker_id: null,
				transcode_stage: TranscodeStage.Stopped,
				transcode_percentage: 0,
				transcode_eta: 0,
				transcode_fps_current: 0,
				transcode_fps_average: 0,
				time_started: 0,
				time_finished: 0,
			});
			await UpdateQueue();
			if ((await GetBusyWorkers()).length == 0) {
				SetQueueStatus(QueueStatus.Idle);
				logger.info("[queue] There are no active workers, setting queue to 'Idle'.");
			}

			callback();
		});

		socket.on('transcode-update', async (job_id: number, status: JobStatusType) => {
			await DatabaseUpdateJobStatus(job_id, status);
			await UpdateQueue();
		});

		socket.on('transcode-error', async (job_id: number) => {
			logger.error(
				`[socket] An error has occurred with job '${job_id}'. The job will be stopped and it's state set to 'Error'.`
			);

			await StopJob(job_id, true);
		});

		socket.on('transcode-finished', async (job_id: number, status: JobStatusType) => {
			await DatabaseUpdateJobStatus(job_id, status);
			await DatabaseUpdateJobOrderIndex(job_id, 0);
			await UpdateQueue();
			await WorkerForAvailableJobs(workerID);
		});

		socket.on('send-log', async (logName: string, logContents: string) => {
			logger.info(
				`[socket] Worker '${workerID}' has sent the log '${logName}' to be saved to '${logPath}'.`
			);
			await WriteWorkerLogToFile(workerID, logName, logContents);
		});
	});
}

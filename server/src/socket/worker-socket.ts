import type { JobStatusType, JobType } from '@handbrake-web/shared/types/database';
import { type HandbrakePresetType } from '@handbrake-web/shared/types/preset';
import logger, { logPath, WriteWorkerLogToFile } from 'logging';
import { AddWorker, RemoveWorker } from 'scripts/connections';
import {
	DatabaseGetSimpleJobByID,
	DatabaseUpdateJobOrderIndex,
	DatabaseUpdateJobStatus,
} from 'scripts/database/database-queue';
import { GetDefaultPresetByName, GetPresetByName } from 'scripts/presets';
import { GetQueue, StopJob, UpdateQueue, WorkerForAvailableJobs } from 'scripts/queue';
import { Server } from 'socket.io';

export default function WorkerSocket(io: Server) {
	io.of('/worker').on('connection', (socket) => {
		const workerID = socket.handshake.query['workerID'] as string;

		logger.info(`[socket] Worker '${workerID}' has connected with ID '${socket.id}'.`);
		AddWorker(socket);
		WorkerForAvailableJobs(workerID);

		socket.on('disconnect', async () => {
			logger.info(`[socket] Worker '${workerID}' with ID '${socket.id}' has disconnected.`);
			RemoveWorker(socket);
			const queue = await GetQueue();
			const workersJob = queue.find((job) => job.worker_id == workerID);
			if (workersJob) {
				StopJob(workersJob.job_id);
				logger.info(
					`[socket] Disconnected worker '${workerID}' was working on job '${workersJob}' when disconnected - setting job to stopped.`
				);
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

		socket.on('transcode-stopped', (job_id: number, status: JobStatusType) => {
			logger.info(
				`[socket] Worker '${workerID}' with ID '${socket.id}' has stopped transcoding.`
			);

			// StopJob(job_id);
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

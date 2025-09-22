import logger, { logPath, WriteWorkerLogToFile } from 'logging';
import { AddWorker, RemoveWorker } from 'scripts/connections';
import {
	GetJobDataFromTable,
	UpdateJobOrderIndexInDatabase,
	UpdateJobStatusInDatabase,
} from 'scripts/database/database-queue';
import { GetDefaultPresetByName, GetPresetByName } from 'scripts/presets';
import { GetQueue, StopJob, UpdateQueue, WorkerForAvailableJobs } from 'scripts/queue';
import { Server } from 'socket.io';
import { type HandbrakePresetType } from 'types/preset';
import { type JobDataType, type JobStatusType } from 'types/queue';

export default function WorkerSocket(io: Server) {
	io.of('/worker').on('connection', (socket) => {
		const workerID = socket.handshake.query['workerID'] as string;

		logger.info(`[socket] Worker '${workerID}' has connected with ID '${socket.id}'.`);
		AddWorker(socket);
		WorkerForAvailableJobs(workerID);

		socket.on('disconnect', () => {
			logger.info(`[socket] Worker '${workerID}' with ID '${socket.id}' has disconnected.`);
			RemoveWorker(socket);
			const queue = GetQueue();
			if (queue) {
				const workersJob = Object.keys(queue)
					.map((key) => parseInt(key))
					.find((jobID) => queue[jobID].status.worker_id == workerID);
				if (workersJob) {
					StopJob(workersJob);
					logger.info(
						`[socket] Disconnected worker '${workerID}' was working on job '${workersJob}' when disconnected - setting job to stopped.`
					);
				}
			}
		});

		socket.on(
			'get-job-data',
			(jobID: number, callback: (jobData: JobDataType | undefined) => void) => {
				const jobData = GetJobDataFromTable(jobID);
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

		socket.on('transcode-update', (job_id: number, status: JobStatusType) => {
			UpdateJobStatusInDatabase(job_id, status);
			UpdateQueue();
		});

		socket.on('transcode-error', (job_id: number) => {
			logger.error(
				`[socket] An error has occurred with job '${job_id}'. The job will be stopped and it's state set to 'Error'.`
			);

			StopJob(job_id, true);
		});

		socket.on('transcode-finished', (job_id: number, status: JobStatusType) => {
			UpdateJobStatusInDatabase(job_id, status);
			UpdateJobOrderIndexInDatabase(job_id, 0);
			UpdateQueue();
			WorkerForAvailableJobs(workerID);
		});

		socket.on('send-log', (logName: string, logContents: string) => {
			logger.info(
				`[socket] Worker '${workerID}' has sent the log '${logName}' to be saved to '${logPath}'.`
			);
			WriteWorkerLogToFile(workerID, logName, logContents);
		});
	});
}

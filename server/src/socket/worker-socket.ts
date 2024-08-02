import { Server } from 'socket.io';
import { AddWorker, RemoveWorker } from 'scripts/connections';
import { TranscodeStage, TranscodeStatusUpdateType } from 'types/transcode';
import { GetQueue, StopJob, UpdateJob, WorkerForAvailableJobs } from 'scripts/queue';
import { JobDataType, JobStatusType } from 'types/queue';
import { GetJobDataFromTable, UpdateJobStatusInDatabase } from 'scripts/database/database-queue';
import { HandbrakePresetType } from 'types/preset';
import { GetPresets } from 'scripts/presets';

export default function WorkerSocket(io: Server) {
	io.of('/worker').on('connection', (socket) => {
		const workerID = socket.handshake.query['workerID'] as string;

		console.log(`[server] Worker '${workerID}' has connected with ID '${socket.id}'.`);
		AddWorker(socket);
		WorkerForAvailableJobs(workerID);

		socket.on('disconnect', () => {
			console.log(`[server] Worker '${workerID}' with ID '${socket.id}' has disconnected.`);
			RemoveWorker(socket);
			const queue = GetQueue();
			if (queue) {
				const workersJob = Object.keys(queue).find(
					(jobID) => queue[jobID].status.worker_id == workerID
				);
				if (workersJob) {
					StopJob(workersJob);
					console.log(
						`[server] Disconnected worker '${workerID}' was working on job '${workersJob}' when disconnected - setting job to stopped.`
					);
				}
			}
		});

		socket.on(
			'get-job-data',
			(jobID: string, callback: (jobData: JobDataType | undefined) => void) => {
				const jobData = GetJobDataFromTable(jobID);
				callback(jobData);
			}
		);

		socket.on(
			'get-preset-data',
			(presetID: string, callback: (presetData: HandbrakePresetType | undefined) => void) => {
				const jobData = GetPresets()[presetID];
				callback(jobData);
			}
		);

		socket.on('transcode-stopped', (status: TranscodeStatusUpdateType) => {
			console.log(
				`[server] Worker '${workerID}' with ID '${socket.id}' has stopped transcoding. The job will be reset.`
			);

			UpdateJob(status);
			WorkerForAvailableJobs(workerID);
		});

		socket.on('transcode-update', (job_id: string, status: JobStatusType) => {
			// console.log(
			// 	`[server] Worker '${workerID}' with ID '${socket.id}' is ${
			// 		TranscodeStage[status.transcode_stage!]
			// 	}:\n percentage: ${data.status.info.percentage}`
			// );

			UpdateJobStatusInDatabase(job_id, status);
			if (status.transcode_stage == TranscodeStage.Finished) {
				WorkerForAvailableJobs(workerID);
			}
		});
	});
}

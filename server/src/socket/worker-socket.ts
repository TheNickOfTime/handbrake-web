import { Server } from 'socket.io';
import { AddWorker, RemoveWorker } from 'scripts/connections';
import { TranscodeStage, TranscodeStatusUpdateType } from 'types/transcode';
import { GetQueue, StopJob, UpdateJob, WorkerForAvailableJobs } from 'scripts/queue';

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
					(jobID) => queue[jobID].worker == workerID
				);
				if (workersJob) {
					StopJob(workersJob);
					console.log(
						`[server] Disconnected worker '${workerID}' was working on job '${workersJob}' when disconnected - setting job to stopped.`
					);
				}
			}
		});

		socket.on('transcode-stopped', (status: TranscodeStatusUpdateType) => {
			console.log(
				`[server] Worker '${workerID}' with ID '${socket.id}' has stopped transcoding. The job will be reset.`
			);

			UpdateJob(status);
			WorkerForAvailableJobs(workerID);
		});

		socket.on('transcoding', (data: TranscodeStatusUpdateType) => {
			console.log(
				`[server] Worker '${workerID}' with ID '${socket.id}' is ${
					TranscodeStage[data.status.stage]
				}:\n percentage: ${data.status.info.percentage}`
			);

			UpdateJob(data);
			if (data.status.stage == TranscodeStage.Finished) {
				WorkerForAvailableJobs(workerID);
			}
		});
	});
}

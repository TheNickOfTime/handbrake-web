import { QueueEntry } from '../../types/queue';
import { TranscodeStage } from '../../types/transcode';
import { connections } from './connections';
import { GetQueueFromDatabase, UpdateJobInDatabase } from './database';
import { StopQueue } from './queue';

export async function SearchForWorker() {
	const queue = await GetQueueFromDatabase();
	if (queue) {
		if (
			Object.keys(queue).length == 0 ||
			Object.values(queue).every((job) => job.status.stage != TranscodeStage.Waiting)
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
}

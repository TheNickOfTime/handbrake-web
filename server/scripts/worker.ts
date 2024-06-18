import { Job, QueueEntry, QueueStatus } from '../../types/queue';
import { TranscodeStage } from '../../types/transcode';
import { GetWorkerID, GetWorkers } from './connections';
import { GetQueueFromDatabase, UpdateJobInDatabase } from './database/database-queue';
import { GetQueueStatus, SetQueueStatus, StopQueue } from './queue';

export function SearchForWorker() {
	const queue = GetQueueFromDatabase();
	if (queue) {
		if (
			Object.keys(queue).length == 0 ||
			Object.values(queue).every(
				(job) =>
					job.status.stage == TranscodeStage.Finished ||
					job.status.stage == TranscodeStage.Stopped
			)
		) {
			if (GetQueueStatus() != QueueStatus.Idle) {
				console.log(
					`[server] There are no active or available jobs, setting the queue to idle.`
				);
				SetQueueStatus(QueueStatus.Idle);
			} else {
				console.log(`[server] There are no jobs available for the queue.`);
			}
			return;
		} else {
			if (GetQueueStatus() != QueueStatus.Active) {
				console.log(`[server] Jobs are now available, setting the queue to active.`);
				SetQueueStatus(QueueStatus.Active);
			}
		}

		console.log(`[server] Searching for a free worker...`);
		const busyWorkers = Object.values(queue)
			.filter((job) => job.worker != null)
			.map((job) => job.worker);
		const availableWorkers = GetWorkers().filter((worker) => {
			const id = GetWorkerID(worker);
			return !busyWorkers.includes(id);
		});

		if (availableWorkers.length > 0) {
			const validJobs = Object.keys(queue).filter(
				(key) => queue[key].status.stage == TranscodeStage.Waiting
			);
			if (validJobs.length > 0) {
				const selectedJobID = validJobs[0];
				const selectedWorker = availableWorkers[0];
				console.log(`[server] Found free worker '${GetWorkerID(selectedWorker)}'.`);

				const selectedJob: Job = queue[selectedJobID];
				selectedJob.worker = GetWorkerID(selectedWorker);
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
}

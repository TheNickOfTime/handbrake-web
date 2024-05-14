import { Server } from 'socket.io';
import { AddWorker, RemoveWorker } from '../scripts/connections';
import { TranscodeStage, TranscodeStatus, TranscodeStatusUpdate } from '../../types/transcode';
import { FinishJob, UpdateJob } from '../scripts/queue';

export default function WorkerSocket(io: Server) {
	io.of('/worker').on('connection', (socket) => {
		console.log(`[server] Worker '${socket.id}' has connected.`);
		AddWorker(socket);

		socket.on('disconnect', () => {
			console.log(`[server] Worker '${socket.id}' has disconnected.`);
			RemoveWorker(socket);
		});

		socket.on('transcoding', (data: TranscodeStatusUpdate) => {
			// console.log(data);
			console.log(
				`[server] Worker '${socket.id}' is ${TranscodeStage[data.status.stage]} at ${
					data.status.info.percentage
				}`
			);

			if (data.status.stage != TranscodeStage.Finished) {
				UpdateJob(data);
			} else {
				FinishJob(data);
			}
		});
	});
}

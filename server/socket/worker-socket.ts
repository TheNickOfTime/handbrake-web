import { Server } from 'socket.io';
import { AddWorker, RemoveWorker } from '../scripts/connections';
import { TranscodeStage, TranscodeStatusUpdate } from '../../types/transcode';
import { UpdateJob } from '../scripts/queue';

export default function WorkerSocket(io: Server) {
	io.of('/worker').on('connection', (socket) => {
		const workerID = socket.handshake.query['workerID'];

		console.log(`[server] Worker '${workerID}' has connected with ID '${socket.id}'.`);
		AddWorker(socket);

		socket.on('disconnect', () => {
			console.log(`[server] Worker '${workerID}' with ID '${socket.id}' has disconnected.`);
			RemoveWorker(socket);
		});

		socket.on('transcoding', (data: TranscodeStatusUpdate) => {
			console.log(
				`[server] Worker '${workerID}' with ID '${socket.id}' is ${
					TranscodeStage[data.status.stage]
				}:\n percentage: ${data.status.info.percentage}`
			);

			UpdateJob(data);
		});
	});
}

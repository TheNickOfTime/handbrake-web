import { Server } from 'socket.io';
import { AddWorker, RemoveWorker } from '../scripts/connections';
import { TranscodeStage, TranscodeStatus } from '../../types/transcode';

export default function WorkerSocket(io: Server) {
	io.of('/worker').on('connection', (socket) => {
		console.log(`[server] Worker '${socket.id}' has connected.`);
		AddWorker(socket);

		socket.on('disconnect', () => {
			console.log(`[server] Worker '${socket.id}' has disconnected.`);
			RemoveWorker(socket);
		});

		socket.on('transcoding', (data: TranscodeStatus) => {
			console.log(
				`[server] Worker '${socket.id}' is ${TranscodeStage[data.stage]} at ${
					data.info.percentage
				}`
			);
		});
	});
}

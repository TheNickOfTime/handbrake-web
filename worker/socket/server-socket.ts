import { Socket } from 'socket.io-client';
import { QueueEntry } from '../../types/queue';
import { StartTranscode, StopTranscode, getJobID } from '../scripts/transcode';
import { serverAddress } from '../worker';

const workerID = process.env.WORKER_ID;

export default function ServerSocket(server: Socket) {
	server.on('connect', () => {
		console.log(
			`[worker] [${workerID}] Connected to the server '${serverAddress}' with id '${server.id}'.`
		);
	});

	server.on('connect_error', (error) => {
		if (server.active) {
			console.log(
				`[worker] [${workerID}] Connection to server lost, will attempt reconnection...`
			);
		} else {
			console.error(
				`[worker] [${workerID}] [error] Connection to server lost, will not attemp reconnection...`
			);
			console.error(error);
		}
	});

	server.on('disconnect', (reason, details) => {
		console.log(`[worker] Disconnected from the server with reason '${reason}'.`);
		console.log(details);
	});

	server.on('transcode', (data: QueueEntry) => {
		console.log(`[worker] Request to transcode queue entry '${data.id}'.`);
		StartTranscode(data, server);
	});

	server.on('stop-transcode', (id: string) => {
		if (getJobID() == id) {
			console.log(`[worker] Request to stop transcoding the current job with id '${id}'.`);
			StopTranscode(server);
		} else {
			console.error(
				`[worker] The id sent with the event 'stop-transcode' does not match the id of the current job.`
			);
		}
	});
}

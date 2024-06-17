import { Socket } from 'socket.io-client';
import { QueueEntry } from '../../types/queue';
import Transcode from '../scripts/transcode';
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
		Transcode(data, server);
	});
}

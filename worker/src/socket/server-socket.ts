import { Socket } from 'socket.io-client';
import { StartTranscode, StopTranscode } from '../scripts/transcode';
import { serverAddress } from '../worker';
import logger from 'logging';

const workerID = process.env.WORKER_ID;

export default function ServerSocket(server: Socket) {
	server.on('connect', () => {
		logger.info(`[socket] Connected to the server '${serverAddress}' with id '${server.id}'.`);
	});

	server.on('connect_error', (error) => {
		if (server.active) {
			logger.info(`[socket] Connection to server lost, will attempt reconnection...`);
		} else {
			logger.error(`[socket] Connection to server lost, will not attempt reconnection...`);
			logger.error(error);
		}
	});

	server.on('disconnect', (reason, details) => {
		logger.info(`[socket] Disconnected from the server with reason '${reason}'.`);
		logger.info(details);
	});

	server.on('start-transcode', (jobID: string) => {
		logger.info(`[socket] Request to transcode queue entry '${jobID}'.`);
		StartTranscode(jobID, server);
	});

	server.on('stop-transcode', (id: string) => {
		logger.info(`[socket] Request to stop transcoding the current job with id '${id}'.`);
		StopTranscode(id, server);
	});
}

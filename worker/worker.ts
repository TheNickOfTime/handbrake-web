import { io } from 'socket.io-client';
import { Job, QueueEntry } from '../types/queue';
import Transcode from './scripts/transcode';
import 'dotenv/config';
import { Socket } from 'socket.io';

const workerID = process.env.WORKER_ID;

if (!workerID) {
	console.error(
		"[worker] No 'WORKER_ID' envrionment variable is set - this worker will not be set up. Please set this via your docker-compose environment section."
	);
	process.exit();
}

const serverURL = process.env.SERVER_URL;
const serverPort = process.env.SERVER_PORT;
const serverAddress = `${serverURL}:${serverPort}/worker`;

const canConnect = serverURL != undefined && serverPort != undefined;
const server = io(serverAddress, {
	autoConnect: false,
	query: { workerID: workerID },
});

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

process.on('SIGINT', (signal) => {
	console.log('[worker] The process has been interrupted, HandBrake Web will now shutdown...');
	process.exit(0);
});

process.on('SIGTERM', (signal) => {
	console.log('[worker] The process has been terminated, HandBrake Web will now shutdown...');
	process.exit(0);
});

if (canConnect) {
	server.connect();
	console.log('[worker] The worker process has started.');
} else {
	console.error(
		'[worker] The SERVER_URL or SERVER_PORT environment variables are not set, no valid server to connect to.'
	);
}

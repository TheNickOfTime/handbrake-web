import { io } from 'socket.io-client';
import { Job, QueueEntry } from '../types/queue';
import Transcode from './scripts/transcode';
import 'dotenv/config';

const serverURL = process.env.SERVER_URL;
const serverPort = process.env.SERVER_PORT;
const serverAddress = `${serverURL}:${serverPort}/worker`;
const canConnect = serverURL != undefined && serverPort != undefined;

// const server = io('http://localhost:9999/worker', { autoConnect: false });
const server = io(serverAddress, { autoConnect: false });

server.on('connect', () => {
	console.log(`[worker] Connected to the server '${serverAddress}' with id '${server.id}'.`);
});

server.on('transcode', (data: QueueEntry) => {
	console.log(`[worker] Request to transcode queue entry '${data.id}'.`);
	Transcode(data, server);
	// console.log(data);
});

if (canConnect) {
	server.connect();
	console.log('[worker] The worker process has started.');
} else {
	console.error(
		'[worker] The SERVER_URL or SERVER_PORT environment variables are not set, no valid server to connect to.'
	);
}

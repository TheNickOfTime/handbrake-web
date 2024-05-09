import { io } from 'socket.io-client';
import { Job, QueueEntry } from '../types/queue';
import Transcode from './scripts/transcode';

const server = io('http://localhost:9999/worker');

server.on('connect', () => {
	console.log(`[worker] Connected to server with id '${server.id}'.`);
});

server.on('transcode', (data: QueueEntry) => {
	console.log(`[worker] Request to transcode queue entry '${data.id}'.`);
	Transcode(data, server);
	// console.log(data);
});

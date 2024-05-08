import { io } from 'socket.io-client';
import { Job } from '../types/queue';
import Transcode from './scripts/transcode';

const server = io('http://localhost:9999/worker');

server.on('connect', () => {
	console.log(`[worker] Connected to server with id '${server.id}'.`);
});

server.on('transcode', (data: Job) => {
	console.log(`[worker] Request to transcode '${data.input}' to '${data.output}'.`);
	Transcode(data, server);
	// console.log(data);
});

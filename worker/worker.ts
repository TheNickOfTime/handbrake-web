import { io } from 'socket.io-client';

const server = io('http://localhost:9999/worker');

server.on('connect', () => {
	console.log(`[worker] Connected to server with id '${server.id}'.`);
});

server.on('transcode', () => {
	console.log(`[worker] Request to transcode.`);
});

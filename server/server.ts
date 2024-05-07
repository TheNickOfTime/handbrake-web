import { createServer } from 'http';
import { Server } from 'socket.io';

const server = createServer();
const io = new Server(server, {
	cors: {
		origin: '*',
	},
});

io.of('/client').on('connection', (socket) => {
	console.log(`[server] Client '${socket.id}' has connected.`);

	socket.on('disconnect', () => {
		console.log(`[server] Client '${socket.id}' has disconnected.`);
	});
});

io.of('/worker').on('connection', (socket) => {
	console.log(`[server] Worker '${socket.id}' has connected.`);

	socket.on('disconnect', () => {
		console.log(`[server] Worker '${socket.id}' has disconnected.`);
	});
});

io.listen(9999);
console.log(`[server] Available at http://localhost:9999`);

import { createServer } from 'http';
import { Server } from 'socket.io';

import ClientSocket from './socket/client-socket';
import WorkerSocket from './socket/worker-socket';

const server = createServer();
const io = new Server(server, {
	cors: {
		origin: '*',
	},
});

ClientSocket(io);
WorkerSocket(io);

io.listen(9999);
console.log(`[server] Available at http://localhost:9999`);

import { createServer } from 'http';
import { Server } from 'socket.io';

import { DatabaseConnect } from './scripts/database';
import ClientSocket from './socket/client-socket';
import WorkerSocket from './socket/worker-socket';
import Initialization from './scripts/initialization';

// Server ------------------------------------------------------------------------------------------
const server = createServer();
const io = new Server(server, {
	cors: {
		origin: '*',
	},
});

// Socket Listeners --------------------------------------------------------------------------------
ClientSocket(io);
WorkerSocket(io);

// Initialization ----------------------------------------------------------------------------------
Initialization(io);

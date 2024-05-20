import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';

import { DatabaseConnect } from './scripts/database';
import ClientSocket from './socket/client-socket';
import WorkerSocket from './socket/worker-socket';
import Initialization from './scripts/initialization';
import ClientRoutes from './routes/client';

// Server ------------------------------------------------------------------------------------------
const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
	},
});

// Routes ------------------------------------------------------------------------------------------
ClientRoutes(app);

// Socket Listeners --------------------------------------------------------------------------------
ClientSocket(io);
WorkerSocket(io);

// Initialization ----------------------------------------------------------------------------------
Initialization(server);

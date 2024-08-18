import { createServer, Server } from 'http';
import express from 'express';
import { Server as SocketServer } from 'socket.io';
import 'dotenv/config';
import cors from 'cors';

import ClientSocket from './socket/client-socket';
import WorkerSocket from './socket/worker-socket';
import Initialization from 'scripts/initialization';
import ClientRoutes from './routes/client';
import Shutdown from 'scripts/shutdown';

// Server ------------------------------------------------------------------------------------------
const app = express();
const server = createServer(app);
const socket = new SocketServer(server, {
	cors: {
		origin: '*',
	},
	pingTimeout: 5000,
});

app.use(cors());

// Routes ------------------------------------------------------------------------------------------
ClientRoutes(app);

// Socket Listeners --------------------------------------------------------------------------------
ClientSocket(socket);
WorkerSocket(socket);

// Initialization & Shutdown -----------------------------------------------------------------------
Initialization(server, socket);
Shutdown(socket);

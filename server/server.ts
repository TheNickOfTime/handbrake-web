import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import 'dotenv/config';
import cors from 'cors';

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

app.use(cors());

// Environment -------------------------------------------------------------------------------------
console.log(`[server] [env] The server port is '${process.env.SERVER_PORT}'.`);
console.log(`[server] [env] The data path is '${process.env.DATA_PATH}'.`);
console.log(`[server] [env] The video path is '${process.env.VIDEO_PATH}'.`);

// Routes ------------------------------------------------------------------------------------------
ClientRoutes(app);

// Socket Listeners --------------------------------------------------------------------------------
ClientSocket(io);
WorkerSocket(io);

// Initialization ----------------------------------------------------------------------------------
Initialization(server);

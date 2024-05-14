import { createServer } from 'http';
import { Server } from 'socket.io';

// import { DatabaseConnect } from './scripts/database';
import ClientSocket from './socket/client-socket';
import WorkerSocket from './socket/worker-socket';
import { ReadDataFromFile } from './scripts/data';
import { presetsPath, SetPresets } from './scripts/presets';
import { queuePath, SetQueue } from './scripts/queue';
import Initialization from './scripts/initialization';

// Server ------------------------------------------------------------------------------------------
const server = createServer();
const io = new Server(server, {
	cors: {
		origin: '*',
	},
});

// Data / Database ---------------------------------------------------------------------------------
// DatabaseConnect();

// Socket Listeners --------------------------------------------------------------------------------
ClientSocket(io);
WorkerSocket(io);

// Initialization ----------------------------------------------------------------------------------
Initialization(io);

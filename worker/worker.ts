import 'dotenv/config';
import { io } from 'socket.io-client';
import ServerSocket from './socket/server-socket';
import Shutdown from './scripts/shutdown';

// Setup -------------------------------------------------------------------------------------------

// Get worker ID from env variable, exit process if it is not set --------------
const workerID = process.env.WORKER_ID;
if (!workerID) {
	console.error(
		"[worker] No 'WORKER_ID' envrionment variable is set - this worker will not be set up. Please set this via your docker-compose environment section."
	);
	process.exit();
}

// Setup the server ------------------------------------------------------------
const serverURL = process.env.SERVER_URL;
const serverPort = process.env.SERVER_PORT;
export const serverAddress = `${serverURL}:${serverPort}/worker`;

const canConnect = serverURL != undefined && serverPort != undefined;
const server = io(serverAddress, {
	autoConnect: false,
	query: { workerID: workerID },
});

// Event listeners ---------------------------------------------------------------------------------
ServerSocket(server);
Shutdown(server);

// Worker Start ------------------------------------------------------------------------------------
if (canConnect) {
	server.connect();
	console.log('[worker] The worker process has started.');
} else {
	console.error(
		'[worker] The SERVER_URL or SERVER_PORT environment variables are not set, no valid server to connect to.'
	);
}

import 'dotenv/config';
import { io } from 'socket.io-client';
import logger from 'logging';
import ServerSocket from 'socket/server-socket';
import { RegisterExitListeners } from './worker-shutdown';

export default async function WorkerStartup() {
	// Setup -------------------------------------------------------------------------------------------

	// Get worker ID from env variable, exit process if it is not set --------------
	const workerID = process.env.WORKER_ID;
	if (!workerID) {
		logger.error(
			"No 'WORKER_ID' envrionment variable is set - this worker will not be set up. Please set this via your docker-compose environment section."
		);
		process.exit(0);
	}

	// Setup the server ------------------------------------------------------------
	const serverURL = process.env.SERVER_URL;
	const serverURLPrefix = serverURL?.match(/^https?:\/\//);
	const serverPort = process.env.SERVER_PORT;
	const serverAddress = `${
		serverURLPrefix ? serverURL : 'http://' + serverURL
	}:${serverPort}/worker`;

	const canConnect = serverURL != undefined && serverPort != undefined;
	const server = io(serverAddress, {
		autoConnect: false,
		query: { workerID: workerID },
	});

	// Event listeners ---------------------------------------------------------------------------------
	ServerSocket(server);
	RegisterExitListeners(server);

	// Worker Start ------------------------------------------------------------------------------------
	if (canConnect) {
		server.connect();
		logger.info('The worker process has started.');
	} else {
		logger.error(
			'The SERVER_URL or SERVER_PORT environment variables are not set, no valid server to connect to.'
		);
	}
}

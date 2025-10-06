import logger from 'logging';
import { Socket } from 'socket.io';

type Client = Socket;

type Worker = Socket;

type Connections = {
	clients: Client[];
	workers: Worker[];
};

const connections: Connections = {
	clients: [],
	workers: [],
};

export function GetClients() {
	return connections.clients;
}

export function AddClient(client: Client) {
	connections.clients.push(client);
	updateConnections();
}

export function RemoveClient(client: Client) {
	connections.clients.splice(connections.clients.indexOf(client));
	updateConnections();
}

export function DisconnectAllClientConnections() {
	connections.clients.forEach((client) => client.disconnect(true));
}

export function AddWorker(worker: Worker) {
	connections.workers.push(worker);
	updateConnections();
}

export function RemoveWorker(worker: Worker) {
	connections.workers.splice(connections.workers.indexOf(worker));
	updateConnections();
}

export function DisconnectAllWorkerConnections() {
	connections.workers.forEach((worker) => worker.disconnect);
}

export function GetWorkers() {
	return connections.workers;
}

export function GetWorkerIDs() {
	return connections.workers.map((worker) => worker.id);
}

export function GetWorkerWithID(id: string) {
	return connections.workers.find((worker) => GetWorkerID(worker) == id);
}

export function GetWorkerID(worker: Worker) {
	return worker.handshake.query['workerID'] as string;
}

export function EmitToAllClients(event: string, data?: any) {
	connections.clients.forEach((client) => {
		client.emit(event, data);
	});
}

export function EmitToAllWorkers(event: string, data?: any) {
	connections.workers.forEach((worker) => {
		worker.emit(event, data);
	});
}

export function EmitToWorkerWithID(workerID: string, event: string, data?: any) {
	const worker = GetWorkerWithID(workerID);
	if (worker) {
		worker.emit(event, data);
	} else {
		logger.error(
			`[server] [error] Could not find a worker with id '${workerID}'. Could not emit event '${event}'.`
		);
	}
}

export function EmitToAllConnections(event: string, data?: any) {
	EmitToAllClients(event, data);
	EmitToAllWorkers(event, data);
}

const updateConnections = () => {
	// logger.info(connections);
	const clients = connections.clients.map((client) => client.id);
	const workers = connections.workers.map((worker) => ({
		workerID: GetWorkerID(worker),
		connectionID: worker.id,
	}));
	const data = {
		clients: clients,
		workers: workers,
	};
	EmitToAllClients('connections-update', data);
};

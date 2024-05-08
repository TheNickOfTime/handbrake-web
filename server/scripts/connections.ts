import { Client, Connections, Worker } from '../../types/socket';

export const connections: Connections = {
	clients: [],
	workers: [],
};

export function AddClient(client: Client) {
	connections.clients.push(client);
	updateConnections();
}

export function RemoveClient(client: Client) {
	connections.clients.splice(connections.clients.indexOf(client));
	updateConnections();
}

export function AddWorker(worker: Worker) {
	connections.workers.push(worker);
	updateConnections();
}

export function RemoveWorker(worker: Worker) {
	connections.workers.splice(connections.workers.indexOf(worker));
	updateConnections();
}

export function EmitToAllClients(event: string, data: any) {
	connections.clients.forEach((client) => {
		client.emit(event, data);
	});
}

export function EmitToAllWorkers(event: string, data: any) {
	connections.workers.forEach((worker) => {
		worker.emit(event, data);
	});
}

export function EmitToAllConnections(event: string, data: any) {
	EmitToAllClients(event, data);
	EmitToAllWorkers(event, data);
}

const updateConnections = () => {
	// console.log(connections);
	const clients = connections.clients.map((client) => client.id);
	const workers = connections.workers.map((worker) => worker.id);
	const data = {
		clients: clients,
		workers: workers,
	};
	EmitToAllClients('connections-update', data);
};

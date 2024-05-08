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

const updateConnections = () => {
	// console.log(connections);
	const clients = connections.clients.map((client) => client.id);
	const workers = connections.workers.map((worker) => worker.id);
	const data = {
		clients: clients,
		workers: workers,
	};
	connections.clients.forEach((client) => {
		client.emit('connections-update', data);
	});
};

import { Client, Connections, Worker } from '../../types/socket';

export const connections: Connections = {
	clients: [],
	workers: [],
};

export function AddClient(client: Client) {
	connections.clients.push(client);
}

export function RemoveClient(client: Client) {
	connections.clients.splice(connections.clients.indexOf(client));
}

export function AddWorker(worker: Worker) {
	connections.workers.push(worker);
}

export function RemoveWorker(worker: Worker) {
	connections.workers.splice(connections.workers.indexOf(worker));
}

import { Socket } from 'socket.io';

export type Client = Socket;

export type Worker = Socket;

export type ClientID = string;

export type workerID = {
	workerID: string;
	connectionID: string;
};

export type Connections = {
	clients: Client[];
	workers: Worker[];
};

export type ConnectionIDs = {
	clients: ClientID[];
	workers: workerID[];
};

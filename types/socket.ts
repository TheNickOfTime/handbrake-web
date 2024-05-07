import { Socket } from 'socket.io';

export type Client = Socket;

export type Worker = Socket;

export type Connections = {
	clients: Client[];
	workers: Worker[];
};

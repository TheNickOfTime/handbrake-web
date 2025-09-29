// import { Socket } from 'socket.io';

// export type Client = Socket;

// export type Worker = Socket;

export type ClientIDType = string;

export type WorkerIDType = {
	workerID: string;
	connectionID: string;
};

// export type Connections = {
// 	clients: Client[];
// 	workers: Worker[];
// };

export type ConnectionIDsType = {
	clients: ClientIDType[];
	workers: WorkerIDType[];
};

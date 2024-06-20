import { Job, QueueEntry } from './queue';

export type QueueTable = {
	id: string;
	job: string;
};

export type StatusTable = {
	id: string;
	state: number;
};

import type { DetailedJobType } from './database';

export enum QueueStatus {
	Stopped,
	Idle,
	Active,
}

export type QueueType = DetailedJobType[];

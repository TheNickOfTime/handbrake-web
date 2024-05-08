import { HandbrakePreset } from './preset';

export type QueueRequest = {
	input: string;
	output: string;
	preset: HandbrakePreset;
};

export type Job = {
	input: string;
	output: string;
	preset: HandbrakePreset;
	worker: string | null;
	status: string;
};

export type Queue = Job[];

export enum QueueStatus {
	Idle,
	Active,
}

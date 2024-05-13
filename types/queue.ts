import { HandbrakePreset } from './preset';
import { TranscodeStatus } from './transcode';

export type QueueRequest = {
	input: string;
	output: string;
	preset: string;
};

export type Job = {
	input: string;
	output: string;
	preset: HandbrakePreset;
	worker: string | null;
	status: TranscodeStatus;
};

export type QueueEntry = {
	id: number;
	job: Job;
};

export type Queue = {
	[index: number]: Job;
};

export enum QueueStatus {
	Idle,
	Active,
}

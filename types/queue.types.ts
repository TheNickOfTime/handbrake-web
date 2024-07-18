import { HandbrakePresetType } from './preset.types';
import { TranscodeStatus } from './transcode.types';

export type QueueRequest = {
	input: string;
	output: string;
	preset: string;
};

export type Job = {
	input: string;
	output: string;
	preset: HandbrakePresetType;
	worker: string | null;
	status: TranscodeStatus;
	time: {
		started?: number;
		finished?: number;
	};
};

export type QueueEntry = {
	id: string;
	job: Job;
};

export type Queue = {
	[index: string]: Job;
};

export enum QueueStatus {
	Stopped,
	Idle,
	Active,
}

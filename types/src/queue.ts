import { HandbrakePresetType } from './preset';
import { TranscodeStatusType } from './transcode';

export type QueueRequestType = {
	input: string;
	output: string;
	preset: string;
};

export type JobType = {
	input: string;
	output: string;
	preset: HandbrakePresetType;
	worker: string | null;
	status: TranscodeStatusType;
	time: {
		started?: number;
		finished?: number;
	};
};

export type QueueEntryType = {
	id: string;
	job: JobType;
};

export type QueueType = {
	[index: string]: JobType;
};

export enum QueueStatus {
	Stopped,
	Idle,
	Active,
}

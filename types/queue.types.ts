import { HandbrakePresetType } from './preset.types';
import { TranscodeStatusType } from './transcode.types';

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

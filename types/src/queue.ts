import { HandbrakePresetType } from './preset';
import { TranscodeStage } from './transcode';

export type QueueRequestType = {
	input: string;
	output: string;
	preset: string;
};

export type JobType = {
	data: JobDataType;
	status: JobStatusType;
	order_index: number;
};

export type JobDataType = {
	input_path: string;
	output_path: string;
	preset_id: string;
};

export type JobStatusType = {
	worker_id?: string | null;
	transcode_stage?: TranscodeStage;
	transcode_percentage?: number;
	transcode_eta?: number;
	transcode_fps_current?: number;
	transcode_fps_average?: number;
	time_started?: number;
	time_finished?: number;
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

export type QueueRequest = {
	input: string;
	output: string;
	preset: object;
};

export type Job = {
	input: string;
	output: string;
	preset: object;
	worker: string | null;
	status: string;
};

export type Queue = Job[];

export enum QueueStatus {
	Idle,
	Active,
}

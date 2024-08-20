export type QueueTableType = {
	id: number;
	job: string;
};

// Jobs --------------------------------------------------------------------------------------------
export type JobsTableType = {
	job_id: number;
	input_path: string;
	output_path: string;
	preset_category: string;
	preset_id: string;
};

export type JobInsertType = {
	[Property in Exclude<keyof JobsTableType, 'job_id'>]: JobsTableType[Property];
};

export type JobsStatusTableType = {
	job_id: number;
	worker_id: string | null;
	transcode_stage: number;
	transcode_percentage: number;
	transcode_eta: number;
	transcode_fps_current: number;
	transcode_fps_average: number;
	time_started: number;
	time_finished: number;
};

export type JobStatusInsertType = {
	job_id: number;
} & {
	[Property in Exclude<keyof JobsStatusTableType, 'job_id'>]?: JobsStatusTableType[Property];
};

export type JobOrderTableType = {
	job_id: number;
	order_index: number;
};

// Queue Status ------------------------------------------------------------------------------------
export type StatusTableType = {
	id: string;
	state: number;
};

// Watchers ----------------------------------------------------------------------------------------
export type WatcherTableType = {
	watcher_id: number;
	watch_path: string;
	output_path: string | null;
	preset_category: string;
	preset_id: string;
	// default_mask: number;
};

export type WatcherRuleTableType = {
	watcher_id: number;
	rule_id: number;
	name: string;
	mask: number;
	base_rule_method: number;
	rule_method: number;
	comparison_method: number;
	comparison: string;
};

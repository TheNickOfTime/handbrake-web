export type QueueTableType = {
	id: string;
	job: string;
};

// Jobs --------------------------------------------------------------------------------------------
export type JobIDsTableType = {
	id: string;
};

export type JobsDataTableType = {
	job_id: string;
	input_path: string;
	output_path: string;
	preset_id: string;
	worker_id?: string;
	time_started?: number;
	time_finished?: number;
};

export type JobsStatusTableType = {
	job_id: string;
	transcode_stage?: number;
	transcode_percentage?: number;
	transcode_eta?: number;
	transcode_fps_current?: number;
	transcode_fps_average?: number;
};

export type JobOrderTableType = {
	job_id: string;
	order_index: number;
};

// Queue Status ------------------------------------------------------------------------------------
export type StatusTableType = {
	id: string;
	state: number;
};

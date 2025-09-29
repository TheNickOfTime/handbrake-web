import type { Generated, Insertable, Selectable, Updateable } from 'kysely';
import type { TranscodeStage } from './transcode';

export interface Database {
	database_version: DatabaseVersionTable;
	status: StatusTable;
	jobs: JobsTable;
	jobs_status: JobsStatusTable;
	jobs_order: JobsOrderTable;
	watchers: WatchersTable;
	watcher_rules: WatcherRulesTable;
}

// Database Version Table --------------------------------------------------------------------------
export interface DatabaseVersionTable {
	version: number;
}

// Status Table ------------------------------------------------------------------------------------
export interface StatusTable {
	id: string;
	state: number;
}

export type GetStatus = Selectable<StatusTable>;
export type AddStatus = Insertable<StatusTable>;
export type UpdateStatus = Updateable<StatusTable>;

// Jobs Tables -------------------------------------------------------------------------------------

// Jobs --------------------------------------------------------------------------------
export interface JobsTable {
	job_id: Generated<number>;
	input_path: string;
	output_path: string;
	preset_category: string;
	preset_id: string;
}

export type GetJob = Selectable<JobsTable>;
export type AddJob = Insertable<JobsTable>;
export type UpdateJob = Updateable<JobsTable>;

// Jobs Status -------------------------------------------------------------------------
export interface JobsStatusTable {
	job_id: Generated<number>;
	worker_id: string | null;
	transcode_stage: TranscodeStage;
	transcode_percentage: Generated<number>;
	transcode_eta: Generated<number>;
	transcode_fps_current: Generated<number>;
	transcode_fps_average: Generated<number>;
	time_started: Generated<number>;
	time_finished: Generated<number>;
}

export type GetJobStatus = Selectable<JobsStatusTable>;
export type AddJobStatus = Insertable<JobsStatusTable>;
export type UpdateJobStatus = Updateable<JobsStatusTable>;

// Jobs Order --------------------------------------------------------------------------
export interface JobsOrderTable {
	job_id: Generated<number>;
	order_index: number;
}

// Watcher Tables ----------------------------------------------------------------------------------

// Watchers ----------------------------------------------------------------------------
export interface WatchersTable {
	output_path: string | null;
	preset_category: string;
	preset_id: string;
	watch_path: string;
	watcher_id: Generated<number>;
}

// Watcher Rules -----------------------------------------------------------------------
export interface WatcherRulesTable {
	base_rule_method: number;
	comparison: string;
	comparison_method: number;
	mask: number;
	name: string;
	rule_id: Generated<number>;
	rule_method: number;
	watcher_id: string;
}

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
export type AddStatus = Omit<Insertable<StatusTable>, 'id'>;
export type UpdateStatus = Omit<Updateable<StatusTable>, 'id'>;

// Jobs Tables -------------------------------------------------------------------------------------

// Jobs --------------------------------------------------------------------------------
export interface JobsTable {
	job_id: Generated<number>;
	input_path: string;
	output_path: string;
	preset_category: string;
	preset_id: string;
}

// Jobs Status -------------------------------------------------------------------------
export interface JobsStatusTable {
	job_id: Generated<number>;
	worker_id: string | null;
	transcode_stage: Generated<TranscodeStage>;
	transcode_percentage: Generated<number>;
	transcode_eta: Generated<number>;
	transcode_fps_current: Generated<number>;
	transcode_fps_average: Generated<number>;
	time_started: Generated<number>;
	time_finished: Generated<number>;
}

// Jobs Order --------------------------------------------------------------------------
export interface JobsOrderTable {
	job_id: Generated<number>;
	order_index: number;
}

// Derived Job Types -------------------------------------------------------------------
export type GetJob = Selectable<JobsTable>;
export type AddJob = Omit<Insertable<JobsTable>, 'job_id'>;
export type UpdateJob = Omit<Updateable<JobsTable>, 'job_id'>;
export type GetJobStatus = Selectable<JobsStatusTable>;
export type AddJobStatus = Omit<Insertable<JobsStatusTable>, 'job_id'>;
export type UpdateJobStatus = Omit<Updateable<JobsStatusTable>, 'job_id'>;
export type GetJobOrder = Selectable<JobsOrderTable>;
export type AddJobOrder = Omit<Insertable<JobsOrderTable>, 'job_id'>;
export type UpdateJobOrder = Omit<Updateable<JobsOrderTable>, 'job_id'>;
export type GetJobDetailed = GetJob & GetJobStatus & GetJobOrder;

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
	watcher_id: number;
}

// Watcher Derived Types ---------------------------------------------------------------
export type GetWatchers = Selectable<WatchersTable>;
export type AddWatcher = Omit<Insertable<WatchersTable>, 'watcher_id'>;
export type UpdateWatcher = Omit<Updateable<WatchersTable>, 'watcher_id'>;
export type GetWatcherRule = Selectable<WatcherRulesTable>;
export type AddWatcherRule = Omit<Insertable<WatcherRulesTable>, 'watcher_id' | 'rule_id'>;
export type UpdateWatcherRule = Omit<Updateable<WatcherRulesTable>, 'watcher_id' | 'rule_id'>;
export type GetWatchersDetailed = GetWatchers & {
	rules: Selectable<WatcherRulesTable>[];
};

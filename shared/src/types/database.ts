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

export type GetStatusType = Selectable<StatusTable>;
export type AddStatusType = Omit<Insertable<StatusTable>, 'id'>;
export type UpdateStatusType = Omit<Updateable<StatusTable>, 'id'>;

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
export type GetJobType = Selectable<JobsTable>;
export type AddJobType = Omit<Insertable<JobsTable>, 'job_id'>;
export type UpdateJobType = Omit<Updateable<JobsTable>, 'job_id'>;
export type GetJobStatusType = Selectable<JobsStatusTable>;
export type AddJobStatusType = Omit<Insertable<JobsStatusTable>, 'job_id'>;
export type UpdateJobStatusType = Omit<Updateable<JobsStatusTable>, 'job_id'>;
export type GetJobOrderType = Selectable<JobsOrderTable>;
export type AddJobOrderType = Omit<Insertable<JobsOrderTable>, 'job_id'>;
export type UpdateJobOrderType = Omit<Updateable<JobsOrderTable>, 'job_id'>;
export type GetJobDetailedType = GetJobType & GetJobStatusType & GetJobOrderType;

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
	rule_id: Generated<number>;
	watcher_id: number;
	name: string;
	mask: number;
	base_rule_method: number;
	rule_method: number;
	comparison_method: number;
	comparison: string;
}

// Watcher Derived Types ---------------------------------------------------------------
export type GetWatchersType = Selectable<WatchersTable>;
export type AddWatcherType = Omit<Insertable<WatchersTable>, 'watcher_id'>;
export type UpdateWatcherType = Omit<Updateable<WatchersTable>, 'watcher_id'>;
export type GetWatcherRuleType = Selectable<WatcherRulesTable>;
export type AddWatcherRuleType = Omit<Insertable<WatcherRulesTable>, 'watcher_id' | 'rule_id'>;
export type UpdateWatcherRuleType = Omit<Updateable<WatcherRulesTable>, 'watcher_id' | 'rule_id'>;
export type GetWatchersDetailedType = GetWatchersType & {
	rules: Omit<Selectable<WatcherRulesTable>, 'watcher_id'>[];
};

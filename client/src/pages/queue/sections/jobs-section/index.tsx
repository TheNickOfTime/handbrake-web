import { QueueType } from '@handbrake-web/shared/types/queue';
import { TranscodeStage } from '@handbrake-web/shared/types/transcode';
import ClearAllIcon from '@icons/check2-all.svg?react';
import ClearFinishedIcon from '@icons/check2.svg?react';
import AddNewIcon from '@icons/plus-lg.svg?react';
import ButtonInput from '~components/base/inputs/button';
import Section from '~components/root/section';
import QueueJobsCategory from '../queue-jobs-category';
import styles from './styles.module.scss';

type Params = {
	queue: QueueType;
	handleAddNewJob: () => void;
	handleClearAllJobs: () => void;
	handleClearFinishedJobs: () => void;
	handleStopJob: (id: number) => void;
	handleResetJob: (id: number) => void;
	handleRemoveJob: (id: number) => void;
};

export default function JobsSection({
	queue,
	handleAddNewJob,
	handleClearAllJobs,
	handleClearFinishedJobs,
	handleStopJob,
	handleResetJob,
	handleRemoveJob,
}: Params) {
	const jobsInProgress: QueueType = queue.filter(
		(job) =>
			job.transcode_stage == TranscodeStage.Transcoding ||
			job.transcode_stage == TranscodeStage.Scanning ||
			job.transcode_stage == TranscodeStage.Unknown
	);

	const jobsWaiting: QueueType = queue.filter(
		(job) => job.transcode_stage == TranscodeStage.Waiting
	);

	const jobsStopped: QueueType = queue.filter(
		(job) =>
			job.transcode_stage == TranscodeStage.Stopped ||
			job.transcode_stage == TranscodeStage.Error
	);
	const jobsFinshed: QueueType = queue.filter(
		(job) => job.transcode_stage == TranscodeStage.Finished
	);
	const onlyFinished = Object.keys(queue).length == Object.keys(jobsFinshed).length;

	return (
		<Section className={styles['jobs']} heading='Jobs'>
			<div className={styles['buttons']}>
				<ButtonInput
					label='Clear All Jobs'
					Icon={ClearAllIcon}
					color='orange'
					onClick={handleClearAllJobs}
				/>
				<ButtonInput
					label='Clear Finished Jobs'
					Icon={ClearFinishedIcon}
					color='yellow'
					onClick={handleClearFinishedJobs}
				/>
				<ButtonInput label='Add New Job' Icon={AddNewIcon} onClick={handleAddNewJob} />
			</div>
			<div className='cards'>
				<QueueJobsCategory
					queue={jobsInProgress}
					id='jobs-in-progress'
					label='In Progress'
					handleStopJob={handleStopJob}
					handleResetJob={handleResetJob}
					handleRemoveJob={handleRemoveJob}
				/>
				<QueueJobsCategory
					queue={jobsWaiting}
					id='jobs-pending'
					label='Pending'
					showHandles={true}
					handleStopJob={handleStopJob}
					handleResetJob={handleResetJob}
					handleRemoveJob={handleRemoveJob}
				/>
				<QueueJobsCategory
					queue={jobsStopped}
					id='jobs-stopped'
					label='Stopped'
					collapsable={true}
					startCollapsed={false}
					handleStopJob={handleStopJob}
					handleResetJob={handleResetJob}
					handleRemoveJob={handleRemoveJob}
				/>
				<QueueJobsCategory
					queue={jobsFinshed}
					id='jobs-finished'
					label='Finished'
					collapsable={!onlyFinished}
					startCollapsed={true}
					handleStopJob={handleStopJob}
					handleResetJob={handleResetJob}
					handleRemoveJob={handleRemoveJob}
				/>
			</div>
		</Section>
	);
}

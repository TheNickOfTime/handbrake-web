import { QueueType } from 'types/queue';
import ButtonInput from 'components/base/inputs/button/button-input';
import SubSection from 'components/section/sub-section';
import QueueJobsCategory from './queue-jobs-category';
import { TranscodeStage } from 'types/transcode';
import { useState } from 'react';

type Params = {
	queue: QueueType;
	handleAddNewJob: () => void;
	handleClearAllJobs: () => void;
	handleClearFinishedJobs: () => void;
	handleStopJob: (id: string) => void;
	handleResetJob: (id: string) => void;
	handleRemoveJob: (id: string) => void;
};

export default function QueueJobs({
	queue,
	handleAddNewJob,
	handleClearAllJobs,
	handleClearFinishedJobs,
	handleStopJob,
	handleResetJob,
	handleRemoveJob,
}: Params) {
	const jobsInProgress: QueueType = Object.fromEntries(
		Object.entries(queue).filter(
			(entry) =>
				entry[1].status.transcode_stage == TranscodeStage.Transcoding ||
				entry[1].status.transcode_stage == TranscodeStage.Scanning
		)
	);

	const jobsWaiting: QueueType = Object.fromEntries(
		Object.entries(queue).filter(
			(entry) => entry[1].status.transcode_stage == TranscodeStage.Waiting
		)
	);

	const jobsStopped: QueueType = Object.fromEntries(
		Object.entries(queue).filter(
			(entry) => entry[1].status.transcode_stage == TranscodeStage.Stopped
		)
	);

	const jobsFinshed: QueueType = Object.fromEntries(
		Object.entries(queue).filter(
			(entry) => entry[1].status.transcode_stage == TranscodeStage.Finished
		)
	);

	const onlyFinished = Object.keys(queue).length == Object.keys(jobsFinshed).length;

	return (
		<SubSection title='Jobs' id='jobs'>
			<div className='buttons'>
				<ButtonInput
					label='Clear All Jobs'
					icon='bi-check2-all'
					color='orange'
					onClick={handleClearAllJobs}
				/>
				<ButtonInput
					label='Clear Finished Jobs'
					icon='bi-check2'
					color='yellow'
					onClick={handleClearFinishedJobs}
				/>
				<ButtonInput label='Add New Job' icon='bi-plus-lg' onClick={handleAddNewJob} />
			</div>
			<div className='cards'>
				<QueueJobsCategory
					queue={jobsInProgress}
					label='In Progress'
					handleStopJob={handleStopJob}
					handleResetJob={handleResetJob}
					handleRemoveJob={handleRemoveJob}
				/>
				<QueueJobsCategory
					queue={jobsWaiting}
					label='Pending'
					showHandles={true}
					handleStopJob={handleStopJob}
					handleResetJob={handleResetJob}
					handleRemoveJob={handleRemoveJob}
				/>
				<QueueJobsCategory
					queue={jobsStopped}
					label='Stopped'
					collapsable={true}
					startCollapsed={false}
					handleStopJob={handleStopJob}
					handleResetJob={handleResetJob}
					handleRemoveJob={handleRemoveJob}
				/>
				<QueueJobsCategory
					queue={jobsFinshed}
					label='Finished'
					collapsable={!onlyFinished}
					startCollapsed={true}
					handleStopJob={handleStopJob}
					handleResetJob={handleResetJob}
					handleRemoveJob={handleRemoveJob}
				/>
			</div>
		</SubSection>
	);
}

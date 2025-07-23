import ButtonInput from '~components/base/inputs/button';
import Section from '~components/root/section';
import { QueueType } from '~types/queue';
import { TranscodeStage } from '~types/transcode';
import QueueJobsCategory from '../queue-jobs-category';

type Params = {
	queue: QueueType;
	handleAddNewJob: () => void;
	handleClearAllJobs: () => void;
	handleClearFinishedJobs: () => void;
	handleStopJob: (id: number) => void;
	handleResetJob: (id: number) => void;
	handleRemoveJob: (id: number) => void;
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
			(entry) =>
				entry[1].status.transcode_stage == TranscodeStage.Stopped ||
				entry[1].status.transcode_stage == TranscodeStage.Error
		)
	);

	const jobsFinshed: QueueType = Object.fromEntries(
		Object.entries(queue).filter(
			(entry) => entry[1].status.transcode_stage == TranscodeStage.Finished
		)
	);

	const onlyFinished = Object.keys(queue).length == Object.keys(jobsFinshed).length;

	return (
		<Section heading='Jobs' id='jobs'>
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

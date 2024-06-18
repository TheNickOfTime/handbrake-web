import { Queue } from '../../../../../types/queue';
import ButtonInput from '../../../components/base/inputs/button/button-input';
import QueueJob from '../components/queue-job';
import SubSection from '../../../components/section/sub-section';
import './queue-jobs.scss';

type Params = {
	queue: Queue;
	handleAddNewJob: () => void;
	handleClearAllJobs: () => void;
	handleClearFinishedJobs: () => void;
	handleStopJob: (id: string) => void;
	handleResetJob: (id: string) => void;
};

export default function QueueJobs({
	queue,
	handleAddNewJob,
	handleClearAllJobs,
	handleClearFinishedJobs,
	handleStopJob,
	handleResetJob,
}: Params) {
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
			{Object.keys(queue).map((key, index) => {
				const job = queue[key];

				return (
					<QueueJob
						key={key}
						// id={key}
						data={job}
						index={index}
						handleStopJob={() => handleStopJob(key)}
						handleResetJob={() => handleResetJob(key)}
					/>
				);
			})}
		</SubSection>
	);
}

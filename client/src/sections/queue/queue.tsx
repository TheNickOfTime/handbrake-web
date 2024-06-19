import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from '../../pages/primary/primary-context';
import Section from '../../components/section/section';
import QueueStatus from './sub-sections/queue-status';
import QueueJobs from './sub-sections/queue-jobs';
import CreateJob from '../../components/overlays/create-job/create-job';
import './queue.scss';

export default function QueueSection() {
	const { socket, queue, queueStatus } = useOutletContext<PrimaryOutletContextType>();

	const [showCreateJob, setShowCreateJob] = useState(false);

	const handleStartQueue = () => {
		socket.emit('start-queue');
	};

	const handleStopQueue = () => {
		socket.emit('stop-queue');
	};

	const handleClearAllJobs = () => {
		socket.emit('clear-queue', false);
	};

	const handleClearFinishedJobs = () => {
		socket.emit('clear-queue', true);
	};

	const handleAddNewJob = () => {
		setShowCreateJob(true);
	};

	const handleStopJob = (id: string) => {
		socket.emit('stop-job', id);
	};

	const handleResetJob = (id: string) => {
		socket.emit('reset-job', id);
	};

	const handleRemoveJob = (id: string) => {
		socket.emit('remove-job', id);
	};

	return (
		<Section title='Queue' id='queue' className={showCreateJob ? 'no-scroll-y' : undefined}>
			<QueueStatus
				queueStatus={queueStatus}
				handleStartQueue={handleStartQueue}
				handleStopQueue={handleStopQueue}
			/>
			<QueueJobs
				queue={queue}
				handleAddNewJob={handleAddNewJob}
				handleClearAllJobs={handleClearAllJobs}
				handleClearFinishedJobs={handleClearFinishedJobs}
				handleStopJob={handleStopJob}
				handleResetJob={handleResetJob}
				handleRemoveJob={handleRemoveJob}
			/>
			{showCreateJob && (
				<CreateJob
					socket={socket}
					onClose={() => {
						setShowCreateJob(false);
					}}
				/>
			)}
		</Section>
	);
}

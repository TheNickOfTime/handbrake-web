import { useContext, useState } from 'react';
import CreateJob from '~components/overlays/create-job';
import Section from '~components/root/section';
import { PrimaryContext } from '~layouts/primary/context';
import QueueJobs from './sections/queue-jobs';
import QueueStatus from './sections/queue-status';
import styles from './styles.module.scss';

export default function QueueSection() {
	const { socket, queue, queueStatus } = useContext(PrimaryContext)!;

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

	const handleStopJob = (id: number) => {
		socket.emit('stop-job', id);
	};

	const handleResetJob = (id: number) => {
		socket.emit('reset-job', id);
	};

	const handleRemoveJob = (id: number) => {
		socket.emit('remove-job', id);
	};

	return (
		<Section
			heading='Queue'
			id={styles['queue']}
			className={showCreateJob ? 'no-scroll-y' : undefined}
		>
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
					onClose={() => {
						setShowCreateJob(false);
					}}
				/>
			)}
		</Section>
	);
}

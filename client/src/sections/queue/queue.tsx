import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from '../../pages/primary/primary-context';

import Section from '../../components/section/section';
import QueueJob from '../../components/queue/queue-job';

import './queue.scss';
import ButtonInput from '../../components/base/inputs/button/button-input';
import { QueueStatus } from '../../../../types/queue';
import CreateJob from '../../components/create-job/create-job';
import { useState } from 'react';

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

	return (
		<Section title='Queue' id='queue'>
			<div className='queue-section status'>
				<h2>Status</h2>
				<div className='status-section'>
					<div className={`status-info ${QueueStatus[queueStatus]}`}>
						<i className='info-icon bi bi-circle-fill' />
						<span className='info-text'>{QueueStatus[queueStatus]}</span>
					</div>
					<div className='status-buttons'>
						<ButtonInput
							label='Start Queue'
							icon='bi-play-fill'
							color='blue'
							disabled={queueStatus == QueueStatus.Active}
							onClick={handleStartQueue}
						/>
						<ButtonInput
							label='Stop Queue'
							icon='bi-stop-fill'
							color='red'
							disabled={queueStatus == QueueStatus.Idle}
							onClick={handleStopQueue}
						/>
					</div>
				</div>
			</div>
			<div className='queue-section jobs'>
				<h2>Jobs</h2>
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
					return <QueueJob key={key} data={job} index={index} />;
				})}
			</div>
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

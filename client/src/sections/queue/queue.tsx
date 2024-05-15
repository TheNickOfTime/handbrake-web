import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from '../../pages/primary/primary-context';

import Section from '../../components/section/section';
import QueueJob from '../../components/queue/queue-job';

import './queue.scss';
import ControlledButton from '../../components/base/inputs/controlled-button';
import { QueueStatus } from '../../../../types/queue';

export default function QueueSection() {
	const { socket, queue, queueStatus } = useOutletContext<PrimaryOutletContextType>();

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
		socket.emit('add-to-queue', {
			input: '/workspaces/handbrake-web/video/video.mov',
			output: '/workspaces/handbrake-web/video/video.mkv',
			preset: '2160p HDR -> 480p HDR',
		});
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
						<ControlledButton
							label='Start Queue'
							icon='bi-play-fill'
							color='blue'
							disabled={queueStatus == QueueStatus.Active}
							onClick={handleStartQueue}
						/>
						<ControlledButton
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
					<ControlledButton
						label='Clear All Jobs'
						icon='bi-check2-all'
						color='orange'
						onClick={handleClearAllJobs}
					/>
					<ControlledButton
						label='Clear Finished Jobs'
						icon='bi-check2'
						color='yellow'
						onClick={handleClearFinishedJobs}
					/>
					<ControlledButton
						label='Add New Job'
						icon='bi-plus-lg'
						onClick={handleAddNewJob}
					/>
				</div>
				{Object.keys(queue).map((key, index) => {
					const job = queue[key];
					return <QueueJob key={key} data={job} index={index} />;
				})}
			</div>
		</Section>
	);
}

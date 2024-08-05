import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from 'pages/primary/primary-context';
import QueueCard from 'components/cards/queue-card/queue-card';
import { QueueType } from 'types/queue';
import QueueJobPreview from './queue-job-preview';

type Params = {
	queue: QueueType;
	id: string;
	label: string;
	showHandles?: boolean;
	collapsable?: boolean;
	startCollapsed?: boolean;
	handleStopJob: (id: string) => void;
	handleResetJob: (id: string) => void;
	handleRemoveJob: (id: string) => void;
};

export default function QueueJobsCategory({
	queue,
	id,
	label,
	showHandles = false,
	collapsable = false,
	startCollapsed = false,
	handleStopJob,
	handleResetJob,
	handleRemoveJob,
}: Params) {
	const { socket } = useOutletContext<PrimaryOutletContextType>();

	const [isCollapsed, setIsCollapsed] = useState(startCollapsed);

	const orderedJobs = Object.keys(queue).sort(
		(a, b) => queue[a].order_index - queue[b].order_index
	);

	// Drag n' drop related stuff
	const [draggedID, setDraggedID] = useState<string>();
	const [draggedInitialIndex, setDraggedInitialIndex] = useState(-1);
	const [draggedDesiredIndex, setDraggedDesiredIndex] = useState(-1);

	const handleDrop = () => {
		if (draggedDesiredIndex > 0) {
			socket.emit('reorder-job', draggedID, draggedDesiredIndex);
		}
	};

	if (Object.keys(queue).length > 0) {
		const orderIndexOffest = queue[orderedJobs[0]].order_index - 1;
		const jobCards = orderedJobs.map((jobID, index) => {
			const job = queue[jobID];

			return (
				<QueueCard
					key={jobID}
					id={jobID}
					job={job}
					index={index}
					categoryID={id}
					showDragHandles={showHandles}
					handleStopJob={() => handleStopJob(jobID)}
					handleResetJob={() => handleResetJob(jobID)}
					handleRemoveJob={() => handleRemoveJob(jobID)}
					setDraggedID={setDraggedID}
					setDraggedDesiredIndex={setDraggedDesiredIndex}
					setDraggedInitialIndex={setDraggedInitialIndex}
					handleDrop={handleDrop}
				/>
			);
		});

		if (draggedDesiredIndex > 0) {
			jobCards.splice(
				draggedDesiredIndex > draggedInitialIndex
					? draggedDesiredIndex - orderIndexOffest
					: draggedDesiredIndex - orderIndexOffest - 1,
				0,
				<QueueJobPreview handleDrop={handleDrop} />
			);
		}

		return (
			<div className='queue-jobs-category'>
				<div className='queue-jobs-category-header'>
					<h4>
						<span>{label}</span>
						{collapsable && isCollapsed && <span> ({Object.keys(queue).length})</span>}
						{collapsable && (
							<i
								className={`bi ${
									isCollapsed ? 'bi-caret-down-fill' : 'bi-caret-up-fill'
								}`}
								onClick={() => setIsCollapsed(!isCollapsed)}
							/>
						)}
					</h4>
				</div>
				{((collapsable && !isCollapsed) || !collapsable) && (
					<div className='queue-jobs-category-cards'>{jobCards}</div>
				)}
			</div>
		);
	}
}

import QueueCard from 'components/cards/queue-card/queue-card';
import { useState } from 'react';
import { QueueType } from 'types/queue';

type Params = {
	queue: QueueType;
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
	label,
	showHandles = false,
	collapsable = false,
	startCollapsed = false,
	handleStopJob,
	handleResetJob,
	handleRemoveJob,
}: Params) {
	const [isCollapsed, setIsCollapsed] = useState(startCollapsed);
	const [dropPreviewIndex, setDropPreviewIndex] = useState(-1);
	const [draggedIndex, setDragIndex] = useState(-1);

	if (Object.keys(queue).length > 0) {
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
					<div className='queue-jobs-category-cards'>
						{Object.keys(queue)
							.sort((a, b) => queue[a].order_index - queue[b].order_index)
							.map((jobID, index) => {
								const job = queue[jobID];

								return (
									<>
										{dropPreviewIndex == job.order_index &&
											draggedIndex > job.order_index && (
												<hr className='drop-preview' />
											)}
										<QueueCard
											key={jobID}
											id={jobID}
											job={job}
											index={index}
											showDragHandles={showHandles}
											handleStopJob={() => handleStopJob(jobID)}
											handleResetJob={() => handleResetJob(jobID)}
											handleRemoveJob={() => handleRemoveJob(jobID)}
											setDropPreviewIndex={setDropPreviewIndex}
											setDragIndex={setDragIndex}
										/>
										{dropPreviewIndex == job.order_index &&
											draggedIndex < job.order_index && (
												<hr className='drop-preview' />
											)}
									</>
								);
							})}
					</div>
				)}
			</div>
		);
	}
}

import QueueCard from 'components/cards/queue-card/queue-card';
import { useState } from 'react';
import { QueueType } from 'types/queue';

type Params = {
	queue: QueueType;
	label: string;
	collapsable?: boolean;
	startCollapsed?: boolean;
	handleStopJob: (id: string) => void;
	handleResetJob: (id: string) => void;
	handleRemoveJob: (id: string) => void;
};

export default function QueueJobsCategory({
	queue,
	label,
	collapsable = false,
	startCollapsed = false,
	handleStopJob,
	handleResetJob,
	handleRemoveJob,
}: Params) {
	const [isCollapsed, setIsCollapsed] = useState(startCollapsed);

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
						{Object.keys(queue).map((key, index) => {
							const job = queue[key];

							return (
								<QueueCard
									key={key}
									data={job}
									index={index}
									handleStopJob={() => handleStopJob(key)}
									handleResetJob={() => handleResetJob(key)}
									handleRemoveJob={() => handleRemoveJob(key)}
								/>
							);
						})}
					</div>
				)}
			</div>
		);
	}
}

import { Link } from '@tanstack/react-router';
import SubSection from '~components/section/sub-section';
import { QueueType } from '~types/queue';
import { WorkerIDType } from '~types/socket';
import styles from './styles.module.scss';

type Params = {
	queue: QueueType;
	workers: WorkerIDType[];
};

export default function DashboardWorkers({ queue, workers }: Params) {
	return (
		<SubSection id={styles['workers']}>
			<Link to='/workers'>
				<h2>
					Workers <i className='bi bi-arrow-right-short' />
				</h2>
			</Link>
			<div className='table-scroll'>
				<table>
					<thead>
						<tr>
							<th>Worker ID</th>
							<th>Connection ID</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{workers.map((worker) => {
							const status = Object.values(queue).find(
								(job) => job.status.worker_id == worker.workerID
							)
								? 'Working'
								: 'Idle';

							return (
								<tr key={`worker-${worker}`}>
									<td>{worker.workerID}</td>
									<td>{worker.connectionID}</td>
									<td
										className={`center ${
											status == 'Working' ? 'color-blue' : 'color-yellow'
										}`}
									>
										{status}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</SubSection>
	);
}

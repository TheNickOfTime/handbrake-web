import { NavLink } from 'react-router-dom';
import { Queue } from '../../../../../types/queue';
import SubSection from '../../../components/section/sub-section';
import { workerID } from '../../../../../types/socket';
import './dashboard-workers.scss';

type Params = {
	queue: Queue;
	workers: workerID[];
};

export default function DashboardWorkers({ queue, workers }: Params) {
	return (
		<SubSection id='workers'>
			<NavLink to='/workers'>
				<h2>
					Workers <i className='bi bi-arrow-right-short' />
				</h2>
			</NavLink>
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
								(job) => job.worker == worker.workerID
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

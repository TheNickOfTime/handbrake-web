import { QueueType } from '@handbrake-web/shared/types/queue';
import { WorkerIDType } from '@handbrake-web/shared/types/socket';
import Section from '~components/root/section';
import DashboardTable from '~pages/dashboard/components/dashboard-table';
import styles from './styles.module.scss';

interface Properties {
	queue: QueueType;
	workers: WorkerIDType[];
}

export default function WorkersSection({ queue, workers }: Properties) {
	return (
		<Section className={styles['workers']} heading='Workers' link='/workers'>
			<DashboardTable>
				<thead>
					<tr>
						<th>Worker ID</th>
						<th>Connection ID</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{workers.map((worker) => {
						const status = queue.find((job) => job.worker_id == worker.workerID)
							? 'Working'
							: 'Idle';

						return (
							<tr key={`worker-${worker}`}>
								<td>{worker.workerID}</td>
								<td>{worker.connectionID}</td>
								<td
									className={`${
										status == 'Working' ? 'color-blue' : 'color-yellow'
									}`}
									align='center'
									data-working={status == 'Working'}
								>
									{status}
								</td>
							</tr>
						);
					})}
				</tbody>
			</DashboardTable>
		</Section>
	);
}

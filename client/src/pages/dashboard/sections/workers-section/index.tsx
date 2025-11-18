import { QueueType } from '@handbrake-web/shared/types/queue';
import { WorkerIDType } from '@handbrake-web/shared/types/socket';
import { WorkerPropertiesMap } from '@handbrake-web/shared/types/worker';
import Section from '~components/root/section';
import DashboardTable from '~pages/dashboard/components/dashboard-table';
import styles from './styles.module.scss';

interface Properties {
	queue: QueueType;
	workers: WorkerIDType[];
	properties: WorkerPropertiesMap;
}

export default function WorkersSection({ queue, workers, properties }: Properties) {
	return (
		<Section className={styles['workers']} heading='Workers' link='/workers'>
			<DashboardTable>
				<thead>
					<tr>
						<th>Worker ID</th>
						<th>Application Version</th>
						<th>HandBrake Version</th>
						<th>Capabilities</th>
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
								<td align='center'>
									{properties[worker.connectionID].version.application}
								</td>
								<td align='center'>
									{properties[worker.connectionID].version.handbrake}
								</td>
								<td align='center'>
									{Object.entries(properties[worker.connectionID].capabilities)
										.filter(([_, available]) => available)
										.map(([capability]) => (
											<span className={styles['capability']}>
												{capability.toUpperCase()}
											</span>
										))}
								</td>
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

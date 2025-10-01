import { DetailedWatcherType } from '@handbrake-web/shared/types/database';
import Section from '~components/root/section';
import DashboardTable from '~pages/dashboard/components/dashboard-table';
import styles from './styles.module.scss';

interface Properties {
	watchers: DetailedWatcherType[];
}

export default function WatchersSection({ watchers }: Properties) {
	return (
		<Section className={styles['watchers']} heading='Watchers' link='/watchers'>
			<DashboardTable>
				<thead>
					<tr>
						<th>Watching Directory</th>
						<th>Output Directory</th>
						<th>Preset</th>
						<th>Rules</th>
					</tr>
				</thead>
				<tbody>
					{watchers.map((watcher) => {
						return (
							<tr key={watcher.watcher_id}>
								<td>{watcher.watch_path}</td>
								<td align='center'>{watcher.output_path || 'N/A'}</td>
								<td align='center'>{watcher.preset_id}</td>
								<td align='center'>{watcher.rules.length}</td>
							</tr>
						);
					})}
				</tbody>
			</DashboardTable>
		</Section>
	);
}

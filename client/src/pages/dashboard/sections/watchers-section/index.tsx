import { WatcherDefinitionObjectType } from '@handbrake-web/shared/types/watcher';
import Section from '~components/root/section';
import DashboardTable from '~pages/dashboard/components/dashboard-table';
import styles from './styles.module.scss';

interface Properties {
	watchers: WatcherDefinitionObjectType;
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
					{Object.keys(watchers)
						.map((watcherID) => parseInt(watcherID))
						.map((watcherID) => {
							const watcher = watchers[watcherID];

							return (
								<tr key={watcherID}>
									<td>{watcher.watch_path}</td>
									<td align='center'>{watcher.output_path || 'N/A'}</td>
									<td align='center'>{watcher.preset_id}</td>
									<td align='center'>{Object.keys(watcher.rules).length}</td>
								</tr>
							);
						})}
				</tbody>
			</DashboardTable>
		</Section>
	);
}

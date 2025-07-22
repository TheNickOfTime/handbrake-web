import { Link } from '@tanstack/react-router';
import SubSection from '~components/section/sub-section';
import { WatcherDefinitionObjectType } from '~types/watcher';
import styles from './styles.module.scss';

type Params = {
	watchers: WatcherDefinitionObjectType;
};

export default function DashboardWatchers({ watchers }: Params) {
	return (
		<SubSection id={styles['watchers']}>
			<Link to='/watchers'>
				<h2>
					Watchers <i className='bi bi-arrow-right-short' />
				</h2>
			</Link>
			<div className='table-scroll'>
				<table>
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
										<td className='center'>{watcher.output_path || 'N/A'}</td>
										<td className='center'>{watcher.preset_id}</td>
										<td className='center'>
											{Object.keys(watcher.rules).length}
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

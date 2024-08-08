import SubSection from 'components/section/sub-section';
import { NavLink } from 'react-router-dom';
import { WatcherDefinitionObjectType } from 'types/watcher';
import './dashboard-watchers.scss';

type Params = {
	watchers: WatcherDefinitionObjectType;
};

export default function DashboardWatchers({ watchers }: Params) {
	return (
		<SubSection id='watchers'>
			<NavLink to='/watchers'>
				<h2>
					Watchers <i className='bi bi-arrow-right-short' />
				</h2>
			</NavLink>
			<div className='table-scroll'>
				<table>
					<thead>
						<tr>
							<th>Watching Directory</th>
							<th>Output Directory</th>
							<th>Preset</th>
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
									</tr>
								);
							})}
					</tbody>
				</table>
			</div>
		</SubSection>
	);
}

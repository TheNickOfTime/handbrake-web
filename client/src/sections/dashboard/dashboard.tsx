import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from 'pages/primary/primary-context';
import Section from 'components/section/section';
import DashboardSummary from './sub-sections/dashboard-summary';
import DashboardQueue from './sub-sections/dashboard-queue';
import DashboardWorkers from './sub-sections/dashboard-workers';
import DashboardPresets from './sub-sections/dashboard-presets';
import './dashboard.scss';
import DashboardWatchers from './sub-sections/dashboard-watchers';

export default function DashboardSection() {
	const { socket, queue, queueStatus, presets, connections, watchers } =
		useOutletContext<PrimaryOutletContextType>();

	return (
		<Section title='Dashboard' id='dashboard'>
			<DashboardSummary connectionStatus={socket.connected} queueStatus={queueStatus} />
			<DashboardQueue queue={queue} />
			<DashboardPresets presets={presets} />
			<DashboardWatchers watchers={watchers} />
			<DashboardWorkers queue={queue} workers={connections.workers} />
		</Section>
	);
}

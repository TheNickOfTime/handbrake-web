import Section from 'components/section/section';
import { PrimaryOutletContextType } from 'pages/primary/context';
import { useOutletContext } from 'react-router-dom';
import './dashboard.scss';
import DashboardPresets from './sub-sections/dashboard-presets';
import DashboardQueue from './sub-sections/dashboard-queue';
import DashboardSummary from './sub-sections/dashboard-summary';
import DashboardWatchers from './sub-sections/dashboard-watchers';
import DashboardWorkers from './sub-sections/dashboard-workers';

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

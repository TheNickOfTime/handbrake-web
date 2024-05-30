import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from '../../pages/primary/primary-context';
import Section from '../../components/section/section';
import DashboardSummary from './sub-sections/dashboard-summary';
import DashboardQueue from './sub-sections/dashboard-queue';
import DashboardWorkers from './sub-sections/dashboard-workers';
import DashboardPresets from './sub-sections/dashboard-presets';
import './dashboard.scss';

export default function DashboardSection() {
	const { socket, queue, queueStatus, presets, connections } =
		useOutletContext<PrimaryOutletContextType>();

	return (
		<Section title='Dashboard' id='dashboard'>
			<DashboardSummary connectionStatus={socket.connected} queueStatus={queueStatus} />
			<DashboardQueue queue={queue} />
			<DashboardWorkers queue={queue} workers={connections.workers} />
			<DashboardPresets presets={presets} />
		</Section>
	);
}

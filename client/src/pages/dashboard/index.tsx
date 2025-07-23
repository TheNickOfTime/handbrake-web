import { useContext } from 'react';
import Page from '~components/root/page';
import { PrimaryContext } from '~layouts/primary/context';
import DashboardPresets from './sections/dashboard-presets';
import DashboardQueue from './sections/dashboard-queue';
import DashboardSummary from './sections/dashboard-summary';
import DashboardWatchers from './sections/dashboard-watchers';
import DashboardWorkers from './sections/dashboard-workers';
import styles from './styles.module.scss';

export default function DashboardSection() {
	const { socket, queue, queueStatus, presets, connections, watchers } =
		useContext(PrimaryContext)!;

	return (
		<Page className={styles['dashboard']} heading='Dashboard'>
			<DashboardSummary connectionStatus={socket.connected} queueStatus={queueStatus} />
			<DashboardQueue queue={queue} />
			<DashboardPresets presets={presets} />
			<DashboardWatchers watchers={watchers} />
			<DashboardWorkers queue={queue} workers={connections.workers} />
		</Page>
	);
}

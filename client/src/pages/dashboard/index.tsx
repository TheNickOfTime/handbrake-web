import { useContext } from 'react';
import Page from '~components/root/page';
import { PrimaryContext } from '~layouts/primary/context';
import PresetsSection from './sections/presets-section';
import QueueSection from './sections/queue-section';
import SummarySection from './sections/summary-section';
import WorkersSection from './sections/workers-section';
import WatchersSection from './sections/watchers-section';
import styles from './styles.module.scss';

export default function DashboardSection() {
	const { socket, queue, queueStatus, presets, connections, properties, watchers } =
		useContext(PrimaryContext)!;

	return (
		<Page className={styles['dashboard']} heading='Dashboard'>
			<SummarySection connectionStatus={socket.connected} queueStatus={queueStatus} />
			<QueueSection queue={queue} />
			<PresetsSection presets={presets} />
			<WatchersSection watchers={watchers} />
			<WorkersSection queue={queue} workers={connections.workers} properties={properties} />
		</Page>
	);
}

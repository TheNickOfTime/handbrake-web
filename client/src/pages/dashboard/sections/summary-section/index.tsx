import { QueueStatus } from '@handbrake-web/shared/types/queue';
import Section from '~components/root/section';
import styles from './styles.module.scss';

interface Properties {
	connectionStatus: boolean;
	queueStatus: QueueStatus;
}

export default function SummarySection({ connectionStatus, queueStatus }: Properties) {
	return (
		<Section className={styles['summary']} heading='Summary'>
			<div className={styles['info']}>
				<div className={`${styles['status']} ${styles['connection']}`}>
					<span>Server: </span>
					<strong data-connected={connectionStatus}>
						{connectionStatus ? 'Connected' : 'Disconnected'}
					</strong>
				</div>
				<div className={`${styles['status']} ${styles['queue']}`}>
					<span>Queue: </span>
					<strong data-status={QueueStatus[queueStatus].toLowerCase()}>
						{QueueStatus[queueStatus]}
					</strong>
				</div>
			</div>
		</Section>
	);
}

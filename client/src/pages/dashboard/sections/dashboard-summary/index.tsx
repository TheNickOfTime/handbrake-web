import SubSection from '~components/section/sub-section';
import { QueueStatus } from '~types/queue';
import styles from './styles.module.scss';

type Params = {
	connectionStatus: boolean;
	queueStatus: QueueStatus;
};

export default function DashboardSummary({ connectionStatus, queueStatus }: Params) {
	return (
		<SubSection title='Summary' id={styles['summary']}>
			<div className={styles['summary-info']}>
				<div className={styles['info']}>
					<span>Server: </span>
					<span className={connectionStatus ? 'color-blue' : 'color-red'}>
						{connectionStatus ? 'Connected' : 'Disconnected'}
					</span>
				</div>
				<div className={styles['info']}>
					<span>Queue: </span>
					<span
						className={
							queueStatus == QueueStatus.Active
								? 'color-blue'
								: queueStatus == QueueStatus.Idle
								? 'color-yellow'
								: queueStatus == QueueStatus.Stopped
								? 'color-red'
								: ''
						}
					>
						{QueueStatus[queueStatus]}
					</span>
				</div>
			</div>
		</SubSection>
	);
}

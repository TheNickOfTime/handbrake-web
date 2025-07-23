import ButtonInput from '~components/base/inputs/button';
import Section from '~components/root/section';
import { QueueStatus as QueueStatusType } from '~types/queue';
import styles from './styles.module.scss';

type Params = {
	queueStatus: QueueStatusType;
	handleStartQueue: () => void;
	handleStopQueue: () => void;
};

export default function QueueStatus({ queueStatus, handleStartQueue, handleStopQueue }: Params) {
	return (
		<Section heading='Status' id={styles['status']}>
			<div className={styles['status-section']}>
				<div className={`${styles['status-info']} ${QueueStatusType[queueStatus]}`}>
					<i className={`${styles['info-icon']} bi bi-circle-fill`} />
					<span className={styles['info-text']}>{QueueStatusType[queueStatus]}</span>
				</div>
				<div className={styles['status-buttons']}>
					<ButtonInput
						label='Start Queue'
						icon='bi-play-fill'
						color='blue'
						disabled={queueStatus != QueueStatusType.Stopped}
						onClick={handleStartQueue}
					/>
					<ButtonInput
						label='Stop Queue'
						icon='bi-stop-fill'
						color='red'
						disabled={queueStatus == QueueStatusType.Stopped}
						onClick={handleStopQueue}
					/>
				</div>
			</div>
		</Section>
	);
}

import StatusIcon from '@icons/circle-fill.svg?react';
import StartIcon from '@icons/play-fill.svg?react';
import StopIcon from '@icons/stop-fill.svg?react';
import ButtonInput from '~components/base/inputs/button';
import Section from '~components/root/section';
import { QueueStatus as QueueStatusType } from '~types/queue';
import styles from './styles.module.scss';

type Params = {
	queueStatus: QueueStatusType;
	handleStartQueue: () => void;
	handleStopQueue: () => void;
};

export default function StatusSection({ queueStatus, handleStartQueue, handleStopQueue }: Params) {
	return (
		<Section className={styles['status']} heading='Status'>
			<div className={styles['wrapper']}>
				<div
					className={styles['info']}
					data-status={QueueStatusType[queueStatus].toLowerCase()}
				>
					<StatusIcon className={styles['icon']} />
					<span className={styles['status']}>{QueueStatusType[queueStatus]}</span>
				</div>
				<div className={styles['buttons']}>
					<ButtonInput
						label='Start Queue'
						Icon={StartIcon}
						color='blue'
						disabled={queueStatus != QueueStatusType.Stopped}
						onClick={handleStartQueue}
					/>
					<ButtonInput
						label='Stop Queue'
						Icon={StopIcon}
						color='red'
						disabled={queueStatus == QueueStatusType.Stopped}
						onClick={handleStopQueue}
					/>
				</div>
			</div>
		</Section>
	);
}

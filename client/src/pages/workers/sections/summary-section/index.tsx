import { QueueType } from '@handbrake-web/shared/types/queue';
import { TranscodeStage } from '@handbrake-web/shared/types/transcode';
import Section from '~components/root/section';
import { WorkerInfo } from '../..';
import styles from './styles.module.scss';

type Params = {
	workerInfo: WorkerInfo;
	queue: QueueType;
};

export default function SummarySection({ workerInfo, queue }: Params) {
	return (
		<Section className={styles['summary-section']} heading='Summary'>
			<div className={styles['summary-info']}>
				<div className={`${styles['info']} ${styles['total']}`}>
					<span>Total Workers: </span>
					<span>{Object.keys(workerInfo).length}</span>
				</div>
				<div className={`${styles['info']} ${styles['idle']}`}>
					<span>Idle Workers: </span>
					<span>
						{
							Object.values(workerInfo).filter((worker) => worker.status == 'Idle')
								.length
						}
					</span>
				</div>
				<div className={`${styles['info']} ${styles['active']}`}>
					<span>Active Workers: </span>
					<span>
						{
							Object.values(workerInfo).filter((worker) => worker.status == 'Working')
								.length
						}
					</span>
				</div>
				<div className={`${styles['info']} ${styles['jobs']}`}>
					<span>Available Jobs: </span>
					<span>
						{
							Object.values(queue).filter(
								(job) =>
									job.status.transcode_stage !=
									(TranscodeStage.Finished || TranscodeStage.Transcoding)
							).length
						}
					</span>
				</div>
			</div>
		</Section>
	);
}

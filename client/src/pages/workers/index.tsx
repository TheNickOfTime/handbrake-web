import { useContext } from 'react';
import Page from '~components/root/page';
import { PrimaryContext } from '~layouts/primary/context';
import StatusSection from './sections/status-section';
import SummarySection from './sections/summary-section';
import styles from './styles.module.scss';

export type WorkerInfo = {
	[index: string]: {
		status: string;
		job: string;
		progress: string;
	};
};

export default function WorkersPage() {
	const { connections, queue } = useContext(PrimaryContext)!;

	const workerInfo: WorkerInfo = Object.fromEntries(
		connections.workers.map((worker) => {
			const job = queue.find((job) => {
				job.worker_id == worker.workerID;
			});
			return [
				worker.workerID,
				{
					status: job ? 'Working' : 'Idle',
					job: job ? job.input_path : 'N/A',
					progress:
						job && job.transcode_percentage
							? (job.transcode_percentage * 100).toFixed(2)
							: 'N/A',
				},
			];
		})
	);

	return (
		<Page className={styles['workers-page']} heading='Workers'>
			<SummarySection workerInfo={workerInfo} queue={queue} />
			<StatusSection workerInfo={workerInfo} />
		</Page>
	);
}

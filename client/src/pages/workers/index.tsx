import { useContext } from 'react';
import Page from '~components/root/page';
import { PrimaryContext } from '~layouts/primary/context';
import WorkersStatus from './sections/status-section';
import WorkersSummary from './sections/summary-section';

export type WorkerInfo = {
	[index: string]: {
		status: string;
		job: string;
		progress: string;
	};
};

export default function WorkersSection() {
	const { connections, queue } = useContext(PrimaryContext)!;

	const workerInfo = connections.workers.reduce((prev: WorkerInfo, cur) => {
		const job = Object.values(queue).find((job) => job.status.worker_id == cur.workerID);
		prev[cur.workerID] = {
			status: job ? 'Working' : 'Idle',
			job: job ? job.data.input_path : 'N/A',
			progress:
				job && job.status.transcode_percentage
					? (job.status.transcode_percentage * 100).toFixed(2)
					: 'N/A',
		};

		return prev;
	}, {});

	return (
		<Page heading='Workers' id='workers'>
			<WorkersSummary workerInfo={workerInfo} queue={queue} />
			<WorkersStatus workerInfo={workerInfo} />
		</Page>
	);
}

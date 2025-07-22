import Section from 'components/section/section';
import { PrimaryOutletContextType } from 'pages/primary/context';
import { useOutletContext } from 'react-router-dom';
import WorkersStatus from './sub-sections/workers-status';
import WorkersSummary from './sub-sections/workers-summary';
import './workers.scss';

export type WorkerInfo = {
	[index: string]: {
		status: string;
		job: string;
		progress: string;
	};
};

export default function WorkersSection() {
	const { connections, queue } = useOutletContext<PrimaryOutletContextType>();

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
		<Section title='Workers' id='workers'>
			<WorkersSummary workerInfo={workerInfo} queue={queue} />
			<WorkersStatus workerInfo={workerInfo} />
		</Section>
	);
}

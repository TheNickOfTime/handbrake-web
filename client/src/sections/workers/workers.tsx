import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from '../../pages/primary/primary-context';
import Section from '../../components/section/section';
import WorkersSummary from './sub-sections/workers-summary';
import WorkersStatus from './sub-sections/workers-status';
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
		const job = Object.values(queue).find((job) => job.worker == cur.workerID);
		prev[cur.workerID] = {
			status: job ? 'Working' : 'Idle',
			job: job ? job.input : 'N/A',
			progress: job ? job.status.info.percentage.replace(' %', '') : 'N/A',
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

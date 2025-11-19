import { HTMLAttributes } from 'react';
import WorkerCard from '~components/cards/worker-card';
import Section from '~components/root/section';
import { WorkerInfoMap } from '../..';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {
	workerInfo: WorkerInfoMap;
}

export default function StatusSection({ workerInfo }: Properties) {
	return (
		<Section className={styles['status-section']} heading='Status'>
			{Object.entries(workerInfo).map(([worker, info]) => (
				<WorkerCard worker={worker} info={info} />
			))}
		</Section>
	);
}

import CircleIcon from '@icons/circle-fill.svg?react';
import ProgressBar from '~components/base/progress';
import Section from '~components/root/section';
import { WorkerInfo } from '../..';
import styles from './styles.module.scss';

type Params = {
	workerInfo: WorkerInfo;
};

export default function StatusSection({ workerInfo }: Params) {
	return (
		<Section className={styles['status-section']} heading='Status'>
			<div className={styles['workers-table']}>
				<table>
					<thead>
						<tr>
							<th>ID</th>
							<th>Status</th>
							<th>Job</th>
							<th>Progress</th>
						</tr>
					</thead>
					<tbody>
						{Object.keys(workerInfo).map((worker) => (
							<tr key={worker} id={worker}>
								<td className={styles['id']}>{worker}</td>
								<td
									className={styles['status']}
									data-status={workerInfo[worker].status.toLowerCase()}
								>
									<CircleIcon />
									<span>{workerInfo[worker].status}</span>
								</td>
								<td className={styles['job']}>{workerInfo[worker].job}</td>
								<td className={styles['progress']}>
									{workerInfo[worker].job != 'N/A' ? (
										<ProgressBar
											percentage={parseFloat(workerInfo[worker].progress)}
										/>
									) : (
										workerInfo[worker].progress
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Section>
	);
}

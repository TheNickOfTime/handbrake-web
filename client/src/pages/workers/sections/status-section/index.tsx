import ProgressBar from '~components/base/progress';
import Section from '~components/root/section';
import { WorkerInfo } from '../..';
import styles from './styles.module.scss';

type Params = {
	workerInfo: WorkerInfo;
};

export default function WorkersStatus({ workerInfo }: Params) {
	return (
		<Section heading='Status' className={styles['status']}>
			<div className='table-scroll'>
				<table className={styles['workers-table']}>
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
									className={
										workerInfo[worker].status == 'Idle'
											? 'status idle'
											: 'status working'
									}
								>
									<i className='bi bi-circle-fill' />
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

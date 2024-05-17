import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from '../../pages/primary/primary-context';
import Section from '../../components/section/section';
import './workers.scss';
import ProgressBar from '../../components/base/progress/progress-bar';
import { TranscodeStage } from '../../../../types/transcode';

type WorkerInfo = {
	[index: string]: {
		status: string;
		job: string;
		progress: string;
	};
};

export default function WorkersSection() {
	const { connections, queue } = useOutletContext<PrimaryOutletContextType>();

	const workerInfo = connections.workers.reduce((prev: WorkerInfo, cur) => {
		const job = Object.values(queue).find((job) => job.worker == cur);
		prev[cur] = {
			status: job ? 'Working' : 'Idle',
			job: job ? job.input : 'N/A',
			progress: job ? job.status.info.percentage.replace(' %', '') : 'N/A',
		};

		return prev;
	}, {});

	return (
		<Section title='Workers' id='workers-section'>
			<div className='sub-section summary'>
				<h2>Summary</h2>
				<div>
					<div className='summary-info'>
						<div className='info total'>
							<span>Total Workers: </span>
							<span>{connections.workers.length}</span>
						</div>
						<div className='info idle'>
							<span>Idle Workers: </span>
							<span>
								{
									Object.values(workerInfo).filter(
										(worker) => worker.status == 'Idle'
									).length
								}
							</span>
						</div>
						<div className='info active'>
							<span>Active Workers: </span>
							<span>
								{
									Object.values(workerInfo).filter(
										(worker) => worker.status == 'Working'
									).length
								}
							</span>
						</div>
						<div className='info jobs'>
							<span>Available Jobs: </span>
							<span>
								{
									Object.values(queue).filter(
										(job) =>
											job.status.stage !=
											(TranscodeStage.Finished || TranscodeStage.Transcoding)
									).length
								}
							</span>
						</div>
					</div>
				</div>
			</div>
			<div className='sub-section table'>
				<h2>Worker Status</h2>
				<div className='table-scroll'>
					<table className='workers-table'>
						<thead>
							<tr>
								<th>ID</th>
								<th>Status</th>
								<th>Job</th>
								<th>Progress</th>
							</tr>
						</thead>
						<tbody>
							{connections.workers.map((worker) => (
								<tr key={worker} id={worker}>
									<td className='id'>{worker}</td>
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
									<td className='job'>{workerInfo[worker].job}</td>
									<td className='progress'>
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
			</div>
		</Section>
	);
}

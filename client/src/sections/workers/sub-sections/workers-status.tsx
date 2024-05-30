import ProgressBar from '../../../components/base/progress/progress-bar';
import SubSection from '../../../components/section/sub-section';
import { WorkerInfo } from '../workers';
import './workers-status.scss';

type Params = {
	workerInfo: WorkerInfo;
};

export default function WorkersStatus({ workerInfo }: Params) {
	return (
		<SubSection title='Status' id='status'>
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
						{Object.keys(workerInfo).map((worker) => (
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
		</SubSection>
	);
}

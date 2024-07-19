import { NavLink } from 'react-router-dom';
import { QueueType } from 'types/queue.types';
import { TranscodeStage } from 'types/transcode.types';
import ProgressBar from 'components/base/progress/progress-bar';
import SubSection from 'components/section/sub-section';
import './dashboard-queue.scss';

type Params = {
	queue: QueueType;
};

export default function DashboardQueue({ queue }: Params) {
	return (
		<SubSection id='queue'>
			<NavLink to='/queue'>
				<h2>
					Queue <i className='bi bi-arrow-right-short' />
				</h2>
			</NavLink>
			<div className='table-scroll'>
				<table>
					<thead>
						<tr>
							<th>Output</th>
							<th>Status</th>
							<th>Progress</th>
						</tr>
					</thead>
					<tbody>
						{Object.keys(queue).map((key) => {
							const job = queue[key];
							const percentage = parseFloat(
								job.status.info.percentage.replace(' %', '')
							);

							return (
								<tr key={`queue-job-${key}`}>
									<td className='output'>{job.output.match(/[^/]+$/)}</td>
									<td
										className={`status center ${
											job.status.stage == TranscodeStage.Waiting
												? 'color-yellow'
												: job.status.stage == TranscodeStage.Scanning
												? 'color-orange'
												: job.status.stage == TranscodeStage.Transcoding
												? 'color-blue'
												: job.status.stage == TranscodeStage.Finished
												? 'color-green'
												: ''
										}`}
									>
										{TranscodeStage[job.status.stage]}
									</td>
									<td className='progress'>
										<ProgressBar percentage={percentage} />
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</SubSection>
	);
}

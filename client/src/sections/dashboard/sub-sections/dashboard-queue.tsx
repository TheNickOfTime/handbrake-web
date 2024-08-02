import { NavLink } from 'react-router-dom';
import { QueueType } from 'types/queue';
import { TranscodeStage } from 'types/transcode';
import ProgressBar from 'components/base/progress/progress-bar';
import SubSection from 'components/section/sub-section';
import './dashboard-queue.scss';
import BadgeInfo from 'components/base/info/badge-info/badge-info';

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
							<th>Input</th>
							<th>Output</th>
							<th>Status</th>
							<th>Progress</th>
						</tr>
					</thead>
					<tbody>
						{Object.keys(queue).map((key) => {
							const job = queue[key];
							const percentage = job.status.transcode_percentage
								? job.status.transcode_percentage * 100
								: 0;

							return (
								<tr key={`queue-job-${key}`}>
									<td className='input' title={job.data.input_path}>
										{job.data.input_path.match(/[^/]+$/)}
										<BadgeInfo info={job.data.input_path} />
									</td>
									<td className='output' title={job.data.output_path}>
										{job.data.output_path.match(/[^/]+$/)}
										<BadgeInfo info={job.data.output_path} />
									</td>
									<td
										className={`status center ${
											job.status.transcode_stage == TranscodeStage.Waiting
												? 'color-yellow'
												: job.status.transcode_stage ==
												  TranscodeStage.Scanning
												? 'color-orange'
												: job.status.transcode_stage ==
												  TranscodeStage.Transcoding
												? 'color-blue'
												: job.status.transcode_stage ==
												  TranscodeStage.Finished
												? 'color-green'
												: ''
										}`}
									>
										{
											TranscodeStage[
												job.status.transcode_stage
													? job.status.transcode_stage
													: 0
											]
										}
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

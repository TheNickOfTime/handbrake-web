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

const statusSorting: { [key in TranscodeStage]: number } = {
	[TranscodeStage.Transcoding]: 1,
	[TranscodeStage.Scanning]: 2,
	[TranscodeStage.Waiting]: 3,
	[TranscodeStage.Stopped]: 4,
	[TranscodeStage.Finished]: 5,
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
							<th>#</th>
							<th>Input</th>
							<th>Output</th>
							<th>Status</th>
							<th>Progress</th>
						</tr>
					</thead>
					<tbody>
						{Object.keys(queue)
							.map((key) => parseInt(key))
							.sort(
								(a, b) => {
									const stageA = queue[a].status.transcode_stage;
									const stageB = queue[b].status.transcode_stage;
									if (stageA != undefined && stageB != undefined) {
										// return (
										// 	statusSorting[queue[a].status.transcode_stage] -
										// 	statusSorting[queue[b].status.transcode_stage]
										// );
										const orderA = queue[a].order_index;
										const orderB = queue[b].order_index;

										const finishedA = queue[a].status.time_finished || 0;
										const finishedB = queue[b].status.time_finished || 0;

										return stageA == stageB
											? orderA != null && orderB != null
												? orderA - orderB
												: finishedA
												? finishedB
													? finishedB - finishedA
													: 1
												: finishedB
												? -1
												: 0
											: statusSorting[stageA] - statusSorting[stageB];
									}

									return 0;
								}
								// queue[a].order_index
								// 	? queue[b].order_index
								// 		? queue[a].order_index - queue[b].order_index
								// 		: -1
								// 	: queue[b].order_index
								// 	? 1
								// 	: 1
							)
							.map((key) => {
								const job = queue[key];
								const percentage = job.status.transcode_percentage
									? job.status.transcode_percentage * 100
									: 0;

								// console.log(job.order_index);

								return (
									<tr key={`queue-job-${key}`}>
										<td className='order center'>{job.order_index}</td>
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

import { statusSorting } from '@handbrake-web/shared/dict/queue.dict';
import { QueueType } from '@handbrake-web/shared/types/queue';
import { TranscodeStage } from '@handbrake-web/shared/types/transcode';
import BadgeInfo from '~components/base/info/badge-info';
import ProgressBar from '~components/base/progress';
import Section from '~components/root/section';
import DashboardTable from '~pages/dashboard/components/dashboard-table';
import styles from './styles.module.scss';

interface Properties {
	queue: QueueType;
}

export default function QueueSection({ queue }: Properties) {
	return (
		<Section className={styles['queue']} heading='Queue' link='/queue'>
			<DashboardTable>
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
					{queue
						.sort(
							(a, b) => {
								const stageA = a.transcode_stage;
								const stageB = b.transcode_stage;
								if (stageA != undefined && stageB != undefined) {
									// return (
									// 	statusSorting[queue[a].status.transcode_stage] -
									// 	statusSorting[queue[b].status.transcode_stage]
									// );
									const orderA = a.order_index;
									const orderB = b.order_index;

									const finishedA = a.time_finished || 0;
									const finishedB = a.time_finished || 0;

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
						.map((job) => {
							const percentage = job.transcode_percentage
								? job.transcode_percentage * 100
								: 0;

							// console.log(job.order_index);

							return (
								<tr key={`queue-job-${job.job_id}`}>
									<td className={styles['order']} align='center'>
										{job.order_index}
									</td>
									<td className={styles['input']} title={job.input_path}>
										{job.input_path.match(/[^/]+$/)}
										<BadgeInfo info={job.input_path} />
									</td>
									<td className={styles['output']} title={job.output_path}>
										{job.output_path.match(/[^/]+$/)}
										<BadgeInfo info={job.output_path} />
									</td>
									<td
										align='center'
										data-status={TranscodeStage[
											job.transcode_stage || 0
										].toLocaleLowerCase()}
									>
										{TranscodeStage[job.transcode_stage || 0]}
									</td>
									<td className={styles['progress']}>
										<ProgressBar
											className={styles['percentage']}
											percentage={percentage}
										/>
									</td>
								</tr>
							);
						})}
				</tbody>
			</DashboardTable>
		</Section>
	);
}

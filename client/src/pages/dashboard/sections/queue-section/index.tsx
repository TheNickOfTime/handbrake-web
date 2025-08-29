import BadgeInfo from '~components/base/info/badge-info';
import ProgressBar from '~components/base/progress';
import Section from '~components/root/section';
import { statusSorting } from '~dict/queue.dict';
import DashboardTable from '~pages/dashboard/components/dashboard-table';
import { QueueType } from '~types/queue';
import { TranscodeStage } from '~types/transcode';
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
									<td className={styles['order']} align='center'>
										{job.order_index}
									</td>
									<td className={styles['input']} title={job.data.input_path}>
										{job.data.input_path.match(/[^/]+$/)}
										<BadgeInfo info={job.data.input_path} />
									</td>
									<td className={styles['output']} title={job.data.output_path}>
										{job.data.output_path.match(/[^/]+$/)}
										<BadgeInfo info={job.data.output_path} />
									</td>
									<td
										align='center'
										data-status={TranscodeStage[
											job.status.transcode_stage || 0
										].toLocaleLowerCase()}
									>
										{TranscodeStage[job.status.transcode_stage || 0]}
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

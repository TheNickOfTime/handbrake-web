import { Queue } from '../../../../../types/queue';
import { TranscodeStage } from '../../../../../types/transcode';
import SubSection from '../../../components/section/sub-section';
import { WorkerInfo } from '../workers';

import './workers-summary.scss';

type Params = {
	workerInfo: WorkerInfo;
	queue: Queue;
};

export default function WorkersSummary({ workerInfo, queue }: Params) {
	return (
		<SubSection title='Summary' id='summary'>
			<div className='summary-info'>
				<div className='info total'>
					<span>Total Workers: </span>
					<span>{Object.keys(workerInfo).length}</span>
				</div>
				<div className='info idle'>
					<span>Idle Workers: </span>
					<span>
						{
							Object.values(workerInfo).filter((worker) => worker.status == 'Idle')
								.length
						}
					</span>
				</div>
				<div className='info active'>
					<span>Active Workers: </span>
					<span>
						{
							Object.values(workerInfo).filter((worker) => worker.status == 'Working')
								.length
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
		</SubSection>
	);
}

import { Job } from '../../../../types/queue';
import { TranscodeStage } from '../../../../types/transcode';
import ProgressBar from '../base/progress/progress-bar';
import QueueJobSection from './queue-job-section';
import './queue-job.scss';

type Params = {
	data: Job;
	index: number;
};

export default function QueueJob({ data, index }: Params) {
	const percentage = parseFloat(data.status.info.percentage.replace(' %', ''));

	return (
		<div className='queue-job'>
			<div className='job-number'>
				<h3>{index + 1}</h3>
			</div>
			<div className='job-info'>
				<QueueJobSection label='Paths'>
					<div className='job-input-path'>{data.input}</div>
					<i className='bi bi-arrow-down' />
					<div className='job-output-path'>{data.output}</div>
				</QueueJobSection>
				<QueueJobSection label='Preset'>
					<div>{data.preset.PresetList[0].PresetName}</div>
				</QueueJobSection>
				<QueueJobSection label='Status'>
					<div>{TranscodeStage[data.status.stage]}</div>
				</QueueJobSection>
				<QueueJobSection label='Progress'>
					<ProgressBar percentage={percentage} />
				</QueueJobSection>
			</div>
		</div>
	);
}

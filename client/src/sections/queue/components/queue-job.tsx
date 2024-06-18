import { Job } from '../../../../../types/queue';
import { TranscodeStage } from '../../../../../types/transcode';
import ProgressBar from '../../../components/base/progress/progress-bar';
import QueueJobSection from './queue-job-section';
import './queue-job.scss';

type Params = {
	// id: string;
	data: Job;
	index: number;
	handleStopJob: () => void;
	handleResetJob: () => void;
};

export default function QueueJob({ data, index, handleStopJob, handleResetJob }: Params) {
	const percentage = parseFloat(data.status.info.percentage.replace(' %', ''));

	const canStop =
		data.status.stage == TranscodeStage.Scanning ||
		data.status.stage == TranscodeStage.Transcoding;
	const canReset =
		data.status.stage == TranscodeStage.Stopped || data.status.stage == TranscodeStage.Finished;

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
				<QueueJobSection label='Worker'>
					<div>{data.worker ? data.worker : 'N/A'}</div>
				</QueueJobSection>
				<QueueJobSection label='Status'>
					<div>{TranscodeStage[data.status.stage]}</div>
				</QueueJobSection>
				<QueueJobSection label='Progress'>
					<ProgressBar percentage={percentage} />
				</QueueJobSection>
			</div>
			<div className='job-actions'>
				<button
					className='job-action-stop'
					title='Stop Job'
					onClick={() => handleStopJob()}
					disabled={!canStop}
				>
					<i className='bi bi-stop-fill' />
				</button>
				<button
					className='job-action-reset'
					title='Reset Job'
					onClick={() => handleResetJob()}
					disabled={!canReset}
				>
					<i className='bi bi-arrow-counterclockwise' />
				</button>
			</div>
		</div>
	);
}

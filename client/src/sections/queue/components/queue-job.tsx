import { Job } from 'types/queue';
import { TranscodeStage } from 'types/transcode';
import ProgressBar from 'components/base/progress/progress-bar';
import QueueJobSection from './queue-job-section';
import './queue-job.scss';

type Params = {
	// id: string;
	data: Job;
	index: number;
	handleStopJob: () => void;
	handleResetJob: () => void;
	handleRemoveJob: () => void;
};

export default function QueueJob({
	data,
	index,
	handleStopJob,
	handleResetJob,
	handleRemoveJob,
}: Params) {
	const percentage = parseFloat(data.status.info.percentage.replace(' %', ''));

	const canStop =
		data.status.stage == TranscodeStage.Scanning ||
		data.status.stage == TranscodeStage.Transcoding;
	const canReset =
		data.status.stage == TranscodeStage.Stopped || data.status.stage == TranscodeStage.Finished;
	const canRemove =
		data.status.stage == TranscodeStage.Waiting ||
		data.status.stage == TranscodeStage.Finished ||
		data.status.stage == TranscodeStage.Stopped ||
		data.worker == null;

	const secondsToTime = (seconds: number) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const newSeconds = Math.floor((seconds % 3600) % 60);
		return (
			(hours > 0 ? `${hours}h` : '') +
			(minutes > 0 ? `${minutes}m` : '') +
			(newSeconds >= 0 ? `${newSeconds}s` : 'N/A')
		);
	};

	return (
		<div className='queue-job'>
			<div className='job-number'>
				<h3>{index + 1}</h3>
			</div>
			<div className='job-info'>
				<div className='job-info-section'>
					<QueueJobSection label='Output'>{data.output.match(/[^/]+$/)}</QueueJobSection>
					<QueueJobSection label='Preset'>
						{data.preset.PresetList[0].PresetName}
					</QueueJobSection>
					<QueueJobSection label='Worker'>
						{data.worker ? data.worker : 'N/A'}
					</QueueJobSection>
					<QueueJobSection label='Status'>
						{TranscodeStage[data.status.stage]}
					</QueueJobSection>
				</div>
				{(data.status.stage == TranscodeStage.Scanning ||
					data.status.stage == TranscodeStage.Transcoding) && (
					<div className='job-info-section'>
						<QueueJobSection label='FPS'>
							{data.status.info.currentFPS
								? `${data.status.info.currentFPS.toFixed(1)}fps`
								: 'N/A'}
						</QueueJobSection>
						<QueueJobSection label='Avg. FPS'>
							{data.status.info.averageFPS
								? `${data.status.info.averageFPS.toFixed(1)}fps`
								: 'N/A'}
						</QueueJobSection>
						<QueueJobSection label='Time Elapsed'>
							{data.time.started
								? secondsToTime((Date.now() - data.time.started) / 1000)
								: 'N/A'}
						</QueueJobSection>
						<QueueJobSection label='Time Left'>
							{data.status.info.eta ? data.status.info.eta : 'N/A'}
						</QueueJobSection>
						<QueueJobSection label='Progress'>
							<ProgressBar percentage={percentage} />
						</QueueJobSection>
					</div>
				)}
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
				<button
					className='job-action-reset'
					title='Remove Job'
					onClick={() => handleRemoveJob()}
					disabled={!canRemove}
				>
					<i className='bi bi-x-lg' />
				</button>
			</div>
		</div>
	);
}

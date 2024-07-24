import { JobType } from 'types/queue';
import { TranscodeStage } from 'types/transcode';
import ProgressBar from 'components/base/progress/progress-bar';
import QueueCardSection from './components/queue-card-section';
import './queue-card.scss';

type Params = {
	// id: string;
	data: JobType;
	index: number;
	handleStopJob: () => void;
	handleResetJob: () => void;
	handleRemoveJob: () => void;
};

export default function QueueCard({
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
					<QueueCardSection label='Input' title={data.input}>
						{data.input.match(/[^/]+$/)}
					</QueueCardSection>
					<QueueCardSection label='Output' title={data.output}>
						{data.output.match(/[^/]+$/)}
					</QueueCardSection>
					<QueueCardSection label='Preset'>
						{data.preset.PresetList[0].PresetName}
					</QueueCardSection>
					<QueueCardSection label='Worker'>
						{data.worker ? data.worker : 'N/A'}
					</QueueCardSection>
					<QueueCardSection label='Status'>
						{TranscodeStage[data.status.stage]}
					</QueueCardSection>
				</div>
				{(data.status.stage == TranscodeStage.Scanning ||
					data.status.stage == TranscodeStage.Transcoding) && (
					<div className='job-info-section'>
						<QueueCardSection label='FPS'>
							{data.status.info.currentFPS
								? `${data.status.info.currentFPS.toFixed(1)}fps`
								: 'N/A'}
						</QueueCardSection>
						<QueueCardSection label='Avg. FPS'>
							{data.status.info.averageFPS
								? `${data.status.info.averageFPS.toFixed(1)}fps`
								: 'N/A'}
						</QueueCardSection>
						<QueueCardSection label='Time Elapsed'>
							{data.time.started
								? secondsToTime((Date.now() - data.time.started) / 1000)
								: 'N/A'}
						</QueueCardSection>
						<QueueCardSection label='Time Left'>
							{data.status.info.eta ? data.status.info.eta : 'N/A'}
						</QueueCardSection>
						<QueueCardSection label='Progress'>
							<ProgressBar percentage={percentage} />
						</QueueCardSection>
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

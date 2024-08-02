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
	const percentage = data.status.transcode_percentage
		? data.status.transcode_percentage * 100
		: 0;

	const canStop =
		data.status.transcode_stage == TranscodeStage.Scanning ||
		data.status.transcode_stage == TranscodeStage.Transcoding;
	const canReset =
		data.status.transcode_stage == TranscodeStage.Stopped ||
		data.status.transcode_stage == TranscodeStage.Finished;
	const canRemove =
		data.status.transcode_stage == TranscodeStage.Waiting ||
		data.status.transcode_stage == TranscodeStage.Finished ||
		data.status.transcode_stage == TranscodeStage.Stopped ||
		data.status.worker_id == null;

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
					<QueueCardSection label='Input' title={data.data.input_path}>
						{data.data.input_path.match(/[^/]+$/)}
					</QueueCardSection>
					<QueueCardSection label='Output' title={data.data.output_path}>
						{data.data.output_path.match(/[^/]+$/)}
					</QueueCardSection>
					<QueueCardSection label='Preset'>{data.data.preset_id}</QueueCardSection>
					<QueueCardSection label='Worker'>
						{data.status.worker_id ? data.status.worker_id : 'N/A'}
					</QueueCardSection>
					<QueueCardSection label='Status'>
						{
							TranscodeStage[
								data.status.transcode_stage ? data.status.transcode_stage : 0
							]
						}
					</QueueCardSection>
				</div>
				{(data.status.transcode_stage == TranscodeStage.Scanning ||
					data.status.transcode_stage == TranscodeStage.Transcoding) && (
					<div className='job-info-section'>
						<QueueCardSection label='FPS'>
							{data.status.transcode_fps_current
								? `${data.status.transcode_fps_current.toFixed(1)}fps`
								: 'N/A'}
						</QueueCardSection>
						<QueueCardSection label='Avg. FPS'>
							{data.status.transcode_fps_average
								? `${data.status.transcode_fps_average.toFixed(1)}fps`
								: 'N/A'}
						</QueueCardSection>
						<QueueCardSection label='Time Elapsed'>
							{data.status.time_started
								? secondsToTime((Date.now() - data.status.time_started) / 1000)
								: 'N/A'}
						</QueueCardSection>
						<QueueCardSection label='Time Left'>
							{data.status.transcode_eta ? data.status.transcode_eta : 'N/A'}
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

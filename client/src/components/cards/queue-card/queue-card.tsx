import { useRef, useState } from 'react';
import { JobType } from 'types/queue';
import { TranscodeStage } from 'types/transcode';
import ProgressBar from 'components/base/progress/progress-bar';
import QueueCardSection from './components/queue-card-section';
import './queue-card.scss';
import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from 'pages/primary/primary-context';

type Params = {
	id: string;
	job: JobType;
	index: number;
	jobID: number;
	categoryID: string;
	showDragHandles?: boolean;
	handleStopJob: () => void;
	handleResetJob: () => void;
	handleRemoveJob: () => void;
	setDraggedID: React.Dispatch<React.SetStateAction<string | undefined>>;
	setDraggedInitialIndex: React.Dispatch<React.SetStateAction<number>>;
	setDraggedDesiredIndex: React.Dispatch<React.SetStateAction<number>>;
	handleDrop: () => void;
};

export default function QueueCard({
	id,
	job,
	index,
	jobID,
	categoryID,
	showDragHandles = false,
	handleStopJob,
	handleResetJob,
	handleRemoveJob,
	setDraggedID,
	setDraggedInitialIndex,
	setDraggedDesiredIndex,
	handleDrop,
}: Params) {
	const { serverURL } = useOutletContext<PrimaryOutletContextType>();

	const selfRef = useRef<HTMLDivElement | null>(null);

	const [draggable, setDraggable] = useState(false);

	const percentage = job.status.transcode_percentage ? job.status.transcode_percentage * 100 : 0;

	const canStop =
		job.status.transcode_stage == TranscodeStage.Scanning ||
		job.status.transcode_stage == TranscodeStage.Transcoding;
	const canReset =
		job.status.transcode_stage == TranscodeStage.Stopped ||
		job.status.transcode_stage == TranscodeStage.Finished;
	const canRemove =
		job.status.transcode_stage == TranscodeStage.Waiting ||
		job.status.transcode_stage == TranscodeStage.Finished ||
		job.status.transcode_stage == TranscodeStage.Stopped ||
		job.status.worker_id == null;

	const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
		setDraggedID(id);
		setDraggedInitialIndex(job.order_index);
		const data = {
			id: id,
			index: index,
			category: categoryID,
		};
		event.dataTransfer.setData('text/plain', JSON.stringify(data));
	};

	const handleDragEnd = (_event: React.DragEvent<HTMLDivElement>) => {
		setDraggable(false);
		setDraggedID(undefined);
		setDraggedInitialIndex(-1);
		setDraggedDesiredIndex(-1);
	};

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		if (
			showDragHandles &&
			JSON.parse(event.dataTransfer.getData('text/plain')).category == categoryID
		) {
			event.preventDefault();

			const thisJobIndex = job.order_index;
			const thisArrayIndex = parseInt(event.currentTarget.id);
			const draggedArrayIndex = JSON.parse(event.dataTransfer.getData('text/plain')).index;
			const indexOffset = thisJobIndex - thisArrayIndex;

			const thisPosition =
				event.currentTarget.getBoundingClientRect().y +
				event.currentTarget.getBoundingClientRect().height / 2;
			const draggedPosition = event.clientY;
			const isAboveThis = draggedPosition < thisPosition;
			const moveDirection =
				draggedArrayIndex == thisArrayIndex
					? 0
					: draggedArrayIndex > thisArrayIndex
					? 1
					: -1;
			const desiredIndex =
				moveDirection == 0
					? draggedArrayIndex + indexOffset
					: moveDirection > 0
					? isAboveThis
						? thisJobIndex
						: thisJobIndex + moveDirection
					: isAboveThis
					? thisJobIndex + moveDirection
					: thisJobIndex;

			// console.log(
			// 	`Move ${draggedArrayIndex + indexOffset} ${isAboveThis ? 'above' : 'below'} ${
			// 		thisArrayIndex + indexOffset
			// 	} at new index ${desiredIndex}`
			// );
			const dropIndex = desiredIndex != draggedArrayIndex + indexOffset ? desiredIndex : -1;
			setDraggedDesiredIndex(dropIndex);
		}
	};

	// const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
	// 	// const targetID = JSON.parse(event.dataTransfer.getData('text/plain')).id;
	// 	// socket.emit('reorder-job', targetID, dropIndex);
	// 	handleDrop();
	// };

	const handleDragHandleMouseDown = (_event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		setDraggable(true);
	};

	const handleDragHandleMouseUp = (_event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		setDraggable(false);
	};

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
		<div
			className='queue-job-outer'
			id={index.toString()}
			draggable={draggable}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
			ref={selfRef}
		>
			<div className='queue-job-inner'>
				{showDragHandles && (
					<div
						className='job-number'
						onMouseDown={handleDragHandleMouseDown}
						onMouseUp={handleDragHandleMouseUp}
					>
						<h3 className='job-number-label'>{index + 1}</h3>
						<i className='bi bi-list' />
					</div>
				)}
				<div className='job-info'>
					<div className='job-info-section'>
						<QueueCardSection label='Input' title={job.data.input_path}>
							{job.data.input_path.match(/[^/]+$/)}
						</QueueCardSection>
						<QueueCardSection label='Output' title={job.data.output_path}>
							{job.data.output_path.match(/[^/]+$/)}
						</QueueCardSection>
						<QueueCardSection label='Preset'>{job.data.preset_id}</QueueCardSection>
						<QueueCardSection label='Worker'>
							{job.status.worker_id ? job.status.worker_id : 'N/A'}
						</QueueCardSection>
						<QueueCardSection label='Status'>
							{
								TranscodeStage[
									job.status.transcode_stage ? job.status.transcode_stage : 0
								]
							}
							{(job.status.transcode_stage == TranscodeStage.Finished ||
								job.status.transcode_stage == TranscodeStage.Stopped ||
								job.status.transcode_stage == TranscodeStage.Error) && (
								<span className='job-log-link'>
									<span> - </span>
									<a
										href={`${serverURL}logs/jobs?id=${jobID}`}
										title='Download Log'
									>
										<i className='bi bi-file-text-fill' />
									</a>
								</span>
							)}
						</QueueCardSection>
					</div>
					{(job.status.transcode_stage == TranscodeStage.Scanning ||
						job.status.transcode_stage == TranscodeStage.Transcoding) && (
						<div className='job-info-section'>
							<QueueCardSection label='FPS'>
								{job.status.transcode_fps_current
									? `${job.status.transcode_fps_current.toFixed(1)}fps`
									: 'N/A'}
							</QueueCardSection>
							<QueueCardSection label='Avg. FPS'>
								{job.status.transcode_fps_average
									? `${job.status.transcode_fps_average.toFixed(1)}fps`
									: 'N/A'}
							</QueueCardSection>
							<QueueCardSection label='Time Elapsed'>
								{job.status.time_started
									? secondsToTime((Date.now() - job.status.time_started) / 1000)
									: 'N/A'}
							</QueueCardSection>
							<QueueCardSection label='Time Left'>
								{job.status.transcode_eta ? job.status.transcode_eta : 'N/A'}
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
		</div>
	);
}

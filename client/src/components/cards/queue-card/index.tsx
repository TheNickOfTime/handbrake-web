import { DetailedJobType } from '@handbrake-web/shared/types/database';
import { TranscodeStage } from '@handbrake-web/shared/types/transcode';
import ResetIcon from '@icons/arrow-counterclockwise.svg?react';
import LogIcon from '@icons/file-text-fill.svg?react';
import ListIcon from '@icons/list.svg?react';
import StopIcon from '@icons/stop-fill.svg?react';
import RemoveIcon from '@icons/x-lg.svg?react';
import { HTMLAttributes, useContext, useRef, useState } from 'react';
import ProgressBar from '~components/base/progress';
import { PrimaryContext } from '~layouts/primary/context';
import QueueCardSection from './components/queue-card-section';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {
	id: string;
	job: DetailedJobType;
	index: number;
	jobID: number;
	categoryID: string;
	showDragHandles?: boolean;
	handleStopJob: () => void;
	handleResetJob: () => void;
	handleRemoveJob: () => void;
	setDraggedID: React.Dispatch<React.SetStateAction<number | undefined>>;
	setDraggedInitialIndex: React.Dispatch<React.SetStateAction<number>>;
	setDraggedDesiredIndex: React.Dispatch<React.SetStateAction<number>>;
	handleDrop: () => void;
}

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
	className,
	...properties
}: Properties) {
	const { serverURL } = useContext(PrimaryContext)!;

	const selfRef = useRef<HTMLDivElement | null>(null);

	const [draggable, setDraggable] = useState(false);

	const percentage = job.transcode_percentage ? job.transcode_percentage * 100 : 0;

	const canStop =
		job.transcode_stage == TranscodeStage.Scanning ||
		job.transcode_stage == TranscodeStage.Transcoding ||
		job.transcode_stage == TranscodeStage.Unknown;
	const canReset =
		job.transcode_stage == TranscodeStage.Stopped ||
		job.transcode_stage == TranscodeStage.Finished ||
		job.transcode_stage == TranscodeStage.Error;
	const canRemove =
		job.transcode_stage == TranscodeStage.Waiting ||
		job.transcode_stage == TranscodeStage.Finished ||
		job.transcode_stage == TranscodeStage.Stopped ||
		job.worker_id == null;

	const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
		setDraggedID(jobID);
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
			className={`queue-card ${styles['queue-card']} ${className || ''}`}
			id={index.toString()}
			draggable={draggable}
			onDragStart={handleDragStart}
			onDragEnd={handleDragEnd}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
			ref={selfRef}
			{...properties}
		>
			<div className={styles['wrapper']}>
				{showDragHandles && (
					<div
						className={styles['job-number']}
						onMouseDown={handleDragHandleMouseDown}
						onMouseUp={handleDragHandleMouseUp}
					>
						<h3 className={styles['number-label']}>{index + 1}</h3>
						<ListIcon className={styles['drag-icon']} />
					</div>
				)}
				<div className={styles['content']}>
					<div className={styles['info']}>
						<QueueCardSection label='Input' title={job.input_path}>
							{job.input_path.match(/[^/]+$/)}
						</QueueCardSection>
						<QueueCardSection label='Output' title={job.output_path}>
							{job.output_path.match(/[^/]+$/)}
						</QueueCardSection>
						<QueueCardSection label='Preset'>{job.preset_id}</QueueCardSection>
						<QueueCardSection label='Worker'>
							{job.worker_id ? job.worker_id : 'N/A'}
						</QueueCardSection>
						<QueueCardSection label='Status'>
							{TranscodeStage[job.transcode_stage ? job.transcode_stage : 0]}
							{(job.transcode_stage == TranscodeStage.Finished ||
								job.transcode_stage == TranscodeStage.Stopped ||
								job.transcode_stage == TranscodeStage.Error) && (
								<span className={styles['job-log-link']}>
									<span> - </span>
									<a
										href={`${serverURL}api/log/job?id=${jobID}`}
										title='Download Log'
									>
										<LogIcon />
									</a>
								</span>
							)}
						</QueueCardSection>
					</div>
					{(job.transcode_stage == TranscodeStage.Scanning ||
						job.transcode_stage == TranscodeStage.Transcoding) && (
						<div className={styles['info']}>
							<QueueCardSection label='FPS'>
								{job.transcode_fps_current
									? `${job.transcode_fps_current.toFixed(1)}fps`
									: 'N/A'}
							</QueueCardSection>
							<QueueCardSection label='Avg. FPS'>
								{job.transcode_fps_average
									? `${job.transcode_fps_average.toFixed(1)}fps`
									: 'N/A'}
							</QueueCardSection>
							<QueueCardSection label='Time Elapsed'>
								{job.time_started
									? secondsToTime((Date.now() - job.time_started) / 1000)
									: 'N/A'}
							</QueueCardSection>
							<QueueCardSection label='Time Left'>
								{job.transcode_eta ? secondsToTime(job.transcode_eta) : 'N/A'}
							</QueueCardSection>
							<QueueCardSection label='Progress'>
								<ProgressBar percentage={percentage} />
							</QueueCardSection>
						</div>
					)}
				</div>
				<div className={styles['actions']}>
					<button
						className={styles['stop']}
						title='Stop Job'
						onClick={() => handleStopJob()}
						disabled={!canStop}
					>
						<StopIcon />
					</button>
					<button
						className={styles['reset']}
						title='Reset Job'
						onClick={() => handleResetJob()}
						disabled={!canReset}
					>
						<ResetIcon />
					</button>
					<button
						className={styles['remove']}
						title='Remove Job'
						onClick={() => handleRemoveJob()}
						disabled={!canRemove}
					>
						<RemoveIcon />
					</button>
				</div>
			</div>
		</div>
	);
}

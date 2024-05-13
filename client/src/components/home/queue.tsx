import { Socket } from 'socket.io-client';
import { QueueStatus, Queue as QueueType } from '../../../../types/queue';
import { TranscodeStage } from '../../../../types/transcode';

type Params = {
	socket: Socket;
	queue: QueueType;
	queueStatus: QueueStatus;
};

export default function Queue({ socket, queue, queueStatus }: Params) {
	const handleStartQueue = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		socket.emit('start-queue');
	};

	const handleStopQueue = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		socket.emit('stop-queue');
	};

	const handleClearQueue = (finishedOnly: boolean) => {
		socket.emit('clear-queue', finishedOnly);
	};

	return (
		<div className='container'>
			<h2>Queue ({QueueStatus[queueStatus]})</h2>
			<div className='d-flex gap-2'>
				<button
					className='btn btn-primary'
					onClick={handleStartQueue}
					disabled={queueStatus == QueueStatus.Active}
				>
					Start Queue
				</button>
				<button
					className='btn btn-danger'
					onClick={handleStopQueue}
					disabled={queueStatus == QueueStatus.Idle}
				>
					Stop Queue
				</button>
				<button className='btn btn-secondary' onClick={() => handleClearQueue(false)}>
					Clear All
				</button>
				<button className='btn btn-secondary' onClick={() => handleClearQueue(true)}>
					Clear Finished
				</button>
			</div>
			<table className='table'>
				<thead>
					<tr>
						<th>#</th>
						<th>Input</th>
						<th>Output</th>
						<th>Worker</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{Object.values(queue).map((entry, index) => (
						<tr>
							<th>{index + 1}</th>
							<td>{entry.input}</td>
							<td>{entry.output}</td>
							<td>{entry.worker ? entry.worker : 'N/A'}</td>
							<td>{TranscodeStage[entry.status.stage]}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

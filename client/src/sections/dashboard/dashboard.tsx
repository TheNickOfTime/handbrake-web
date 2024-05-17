import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from '../../pages/primary/primary-context';
import Section from '../../components/section/section';
import './dashboard.scss';
import ProgressBar from '../../components/base/progress/progress-bar';
import { TranscodeStage } from '../../../../types/transcode';
import { QueueStatus } from '../../../../types/queue';

export default function DashboardSection() {
	const { socket, queue, queueStatus, presets, connections } =
		useOutletContext<PrimaryOutletContextType>();

	return (
		<Section title='Dashboard' id='dashboard-section'>
			<div className='sub-section summary'>
				<h2>Summary</h2>
				<div className='summary-info'>
					<div className='info'>
						<span>Server: </span>
						<span className={socket.connected ? 'color-blue' : 'color-red'}>
							{socket.connected ? 'Connected' : 'Disconnected'}
						</span>
					</div>
					<div className='info'>
						<span>Queue: </span>
						<span
							className={
								queueStatus == QueueStatus.Active
									? 'color-blue'
									: queueStatus == QueueStatus.Idle
									? 'color-yellow'
									: queueStatus == QueueStatus.Stopped
									? 'color-red'
									: ''
							}
						>
							{QueueStatus[queueStatus]}
						</span>
					</div>
				</div>
			</div>
			<div className='sub-section queue'>
				<h2>Queue</h2>
				<div className='table-scroll'>
					<table>
						<thead>
							<th>Input</th>
							<th>Output</th>
							<th>Status</th>
							<th>Progress</th>
						</thead>
						<tbody>
							{Object.values(queue).map((job) => {
								const percentage = parseFloat(
									job.status.info.percentage.replace(' %', '')
								);

								return (
									<tr>
										<td>{job.input}</td>
										<td>{job.output}</td>
										<td
											className={`center ${
												job.status.stage == TranscodeStage.Waiting
													? 'color-yellow'
													: job.status.stage == TranscodeStage.Scanning
													? 'color-orange'
													: job.status.stage == TranscodeStage.Transcoding
													? 'color-blue'
													: job.status.stage == TranscodeStage.Finished
													? 'color-green'
													: ''
											}`}
										>
											{TranscodeStage[job.status.stage]}
										</td>
										<td>
											<ProgressBar percentage={percentage} />
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
			<div className='sub-section workers'>
				<h2>Workers</h2>
				<div className='table-scroll'>
					<table>
						<thead>
							<th>ID</th>
							<th>Status</th>
						</thead>
						<tbody>
							{connections.workers.map((worker) => {
								const status = Object.values(queue).find(
									(job) => job.worker == worker
								)
									? 'Working'
									: 'Idle';

								return (
									<tr>
										<td>{worker}</td>
										<td
											className={`center ${
												status == 'Working' ? 'color-blue' : 'color-yellow'
											}`}
										>
											{status}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
			<div className='sub-section presets'>
				<h2>Presets</h2>
				<div className='table-scroll'>
					<table>
						<thead>
							<th>Name</th>
							<th>Format</th>
							<th>Resolution</th>
							<th>Encoder</th>
						</thead>
						<tbody>
							{Object.values(presets).map((preset) => {
								const info = preset.PresetList[0];
								const resolution = `${info.PictureWidth}x${info.PictureHeight}`;

								return (
									<tr>
										<td>{info.PresetName}</td>
										<td className='center'>{info.FileFormat}</td>
										<td className='center'>{resolution}</td>
										<td className='center'>{info.VideoEncoder}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</Section>
	);
}

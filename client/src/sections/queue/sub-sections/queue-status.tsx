import SubSection from '../../../components/section/sub-section';
import './queue-status.scss';
import ButtonInput from '../../../components/base/inputs/button/button-input';
import { QueueStatus as QueueStatusType } from '../../../../../types/queue';

type Params = {
	queueStatus: QueueStatusType;
	handleStartQueue: () => void;
	handleStopQueue: () => void;
};

export default function QueueStatus({ queueStatus, handleStartQueue, handleStopQueue }: Params) {
	return (
		<SubSection title='Status' id='status'>
			<div className='status-section'>
				<div className={`status-info ${QueueStatusType[queueStatus]}`}>
					<i className='info-icon bi bi-circle-fill' />
					<span className='info-text'>{QueueStatusType[queueStatus]}</span>
				</div>
				<div className='status-buttons'>
					<ButtonInput
						label='Start Queue'
						icon='bi-play-fill'
						color='blue'
						disabled={queueStatus != QueueStatusType.Stopped}
						onClick={handleStartQueue}
					/>
					<ButtonInput
						label='Stop Queue'
						icon='bi-stop-fill'
						color='red'
						disabled={queueStatus == QueueStatusType.Stopped}
						onClick={handleStopQueue}
					/>
				</div>
			</div>
		</SubSection>
	);
}

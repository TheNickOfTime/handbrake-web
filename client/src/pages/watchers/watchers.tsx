import ButtonInput from 'components/base/inputs/button/button-input';
import WatcherCard from 'components/cards/watcher-card/watcher-card';
import RegisterWatcher from 'components/overlays/register-watcher/register-watcher';
import Section from 'components/section/section';
import SubSection from 'components/section/sub-section';
import { PrimaryOutletContextType } from 'pages/primary/context';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { WatcherRuleDefinitionType } from 'types/watcher';
import './watchers.scss';

export default function WatchersSection() {
	const { socket, watchers } = useOutletContext<PrimaryOutletContextType>();

	const [showRegisterOverlay, setShowRegisterOverlay] = useState(false);

	const handleNewWatcher = () => {
		setShowRegisterOverlay(true);
	};

	const handleRemoveWatcher = (rowid: number) => {
		socket.emit('remove-watcher', rowid);
	};

	const handleAddRule = (id: number, rule: WatcherRuleDefinitionType) => {
		socket.emit('add-watcher-rule', id, rule);
	};

	const handleUpdateRule = (id: number, rule: WatcherRuleDefinitionType) => {
		socket.emit('update-watcher-rule', id, rule);
	};

	const handleRemoveRule = (id: number) => {
		socket.emit('remove-watcher-rule', id);
	};

	const watcherIDs = Object.keys(watchers).map((id) => parseInt(id));

	return (
		<Section title='Watchers' id='watchers'>
			<SubSection id='watchers-status'>
				<div className='watcher-count'>Watchers: {watcherIDs.length}</div>
				<ButtonInput
					label='Register New Watcher'
					icon='bi-plus-lg'
					color='blue'
					onClick={handleNewWatcher}
				/>
			</SubSection>
			{watcherIDs.length > 0 && (
				<SubSection title='Registered Watchers' id='registered-watchers'>
					{watcherIDs.map((watcherID, index) => (
						<WatcherCard
							watcherID={watcherID}
							watcher={watchers[watcherID]}
							index={index}
							handleRemoveWatcher={handleRemoveWatcher}
							handleAddRule={handleAddRule}
							handleUpdateRule={handleUpdateRule}
							handleRemoveRule={handleRemoveRule}
							key={`watcher-card-${watcherID}`}
						/>
					))}
				</SubSection>
			)}
			{showRegisterOverlay && (
				<RegisterWatcher onClose={() => setShowRegisterOverlay(false)} />
			)}
		</Section>
	);
}

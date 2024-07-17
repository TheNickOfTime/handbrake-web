import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from 'pages/primary/primary-context';
import ButtonInput from 'components/base/inputs/button/button-input';
import RegisterWatcher from 'components/overlays/register-watcher/register-watcher';
import Section from 'components/section/section';
import SubSection from 'components/section/sub-section';
import WatcherCard from 'components/cards/watcher-card/watcher-card';
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

	return (
		<Section title='Watchers' id='watchers'>
			<SubSection id='watchers-status'>
				<div className='watcher-count'>Watchers: {watchers.length}</div>
				<ButtonInput
					label='Register New Watcher'
					icon='bi-plus-lg'
					color='blue'
					onClick={handleNewWatcher}
				/>
			</SubSection>
			{watchers.length > 0 && (
				<SubSection title='Registered Watchers' id='registered-watchers'>
					{watchers.map((watcher) => (
						<WatcherCard
							watcher={watcher}
							handleRemoveWatcher={handleRemoveWatcher}
							key={`watcher-card-${watcher.rowid}`}
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

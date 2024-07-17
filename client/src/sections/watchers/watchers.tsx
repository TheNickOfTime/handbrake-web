import { PrimaryOutletContextType } from 'pages/primary/primary-context';
import { useOutletContext } from 'react-router-dom';
import './watchers.scss';
import Section from 'components/section/section';
import SubSection from 'components/section/sub-section';
import WatcherCard from 'components/cards/watcher-card/watcher-card';

export default function WatchersSection() {
	const { socket, watchers } = useOutletContext<PrimaryOutletContextType>();

	const handleRemoveWatcher = (rowid: number) => {
		socket.emit('remove-watcher', rowid);
	};

	return (
		<Section title='Watchers' id='watchers'>
			<SubSection title='Registered Watchers' id='registered-watchers'>
				{watchers.map((watcher) => (
					<WatcherCard
						watcher={watcher}
						handleRemoveWatcher={handleRemoveWatcher}
						key={`watcher-card-${watcher.rowid}`}
					/>
				))}
			</SubSection>
		</Section>
	);
}

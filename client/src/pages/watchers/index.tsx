import RegisterIcon from '@icons/plus-lg.svg?react';
import { useContext, useState } from 'react';
import ButtonInput from '~components/base/inputs/button';
import WatcherCard from '~components/cards/watcher-card';
import RegisterWatcher from '~components/overlays/register-watcher';
import Page from '~components/root/page';
import Section from '~components/root/section';
import { PrimaryContext } from '~layouts/primary/context';
import { WatcherRuleDefinitionType } from '~types/watcher';
import styles from './styles.module.scss';

export default function WatchersPage() {
	const { socket, watchers } = useContext(PrimaryContext)!;

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
		<Page className={styles['watchers-page']} heading='Watchers'>
			<Section className={styles['status']}>
				<div className={styles['count']}>Watchers: {watcherIDs.length}</div>
				<ButtonInput
					label='Register New Watcher'
					Icon={RegisterIcon}
					color='blue'
					onClick={handleNewWatcher}
				/>
			</Section>
			{watcherIDs.length > 0 && (
				<Section className={styles['registered-watchers']} heading='Registered Watchers'>
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
				</Section>
			)}
			{showRegisterOverlay && (
				<RegisterWatcher onClose={() => setShowRegisterOverlay(false)} />
			)}
		</Page>
	);
}

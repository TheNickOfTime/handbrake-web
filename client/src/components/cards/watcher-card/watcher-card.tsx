import { WatcherWithRowID } from 'types/watcher';
import ButtonInput from 'components/base/inputs/button/button-input';
import './watcher-card.scss';
import TextInfo from 'components/base/info/text-info/text-info';

type Params = {
	watcher: WatcherWithRowID;
	handleRemoveWatcher: (rowid: number) => void;
};

export default function WatcherCard({ watcher, handleRemoveWatcher }: Params) {
	return (
		<div className='watcher-card'>
			<div className='watcher-card-header'>
				<h3 className='watcher-card-header-label'>{watcher.watch_path}</h3>
				<div className='watcher-card-header-buttons'>
					<ButtonInput
						icon='bi-trash-fill'
						color='red'
						onClick={() => handleRemoveWatcher(watcher.rowid)}
					/>
				</div>
			</div>
			<div className='watcher-card-body'>
				<TextInfo label='Output Path'>{watcher.output_path || 'N/A'}</TextInfo>
				<TextInfo label='Preset'>{watcher.preset_id}</TextInfo>
			</div>
		</div>
	);
}

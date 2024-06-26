import { useState } from 'react';
import { FileBrowserMode } from 'types/file-browser';
import { DirectoryItem } from 'types/directory';
import FileBrowser from 'components/modules/file-browser/file-browser';
import './path-input.scss';

type Params = {
	id: string;
	label: string;
	path: string;
	mode: FileBrowserMode;
	value: string | undefined;
	onConfirm?: (item: DirectoryItem) => void;
};

export default function PathInput({ id, label, path, mode, value, onConfirm }: Params) {
	const [showFileBrowser, setShowFileBrowser] = useState(false);

	const handleConfirm = (item: DirectoryItem) => {
		if (onConfirm) {
			onConfirm(item);
		}
		setShowFileBrowser(false);
	};

	return (
		<div className='path-input'>
			<div className='input-section'>
				{label && (
					<label className='input-label' htmlFor={id}>
						{label}
					</label>
				)}
				<input
					className='input-path-text form-item'
					id={id}
					type='text'
					value={value ? value : 'N/A'}
					size={1}
					disabled
				/>
				<button
					className='controlled-button blue'
					onClick={(event) => {
						event?.preventDefault();
						setShowFileBrowser(!showFileBrowser);
					}}
					// onBlur={() => setShowTree(false)}
				>
					<span className='button-label'>{showFileBrowser ? 'Cancel' : 'Browse'}</span>
				</button>
			</div>
			{showFileBrowser && (
				<div className='browser-section'>
					<FileBrowser basePath={path} mode={mode} onConfirm={handleConfirm} />
				</div>
			)}
		</div>
	);
}

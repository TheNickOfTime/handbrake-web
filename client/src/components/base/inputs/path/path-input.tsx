import { useState } from 'react';
import { FileBrowserMode } from 'types/file-browser.types';
import { DirectoryItemType } from 'types/directory.types';
import FileBrowser from 'components/modules/file-browser/file-browser';
import './path-input.scss';

type Params = {
	id: string;
	label: string;
	path: string;
	mode: FileBrowserMode;
	allowCreate?: boolean;
	value: string | undefined;
	onConfirm?: (item: DirectoryItemType) => void;
};

export default function PathInput({
	id,
	label,
	path,
	mode,
	allowCreate = false,
	value,
	onConfirm,
}: Params) {
	const [showFileBrowser, setShowFileBrowser] = useState(false);

	const handleConfirm = (item: DirectoryItemType) => {
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
					type='button'
					onClick={(event) => {
						event.preventDefault();
						setShowFileBrowser(!showFileBrowser);
					}}
					onKeyDown={(event) => {
						event.preventDefault();
					}}
				>
					<span className='button-label'>{showFileBrowser ? 'Cancel' : 'Browse'}</span>
				</button>
			</div>
			{showFileBrowser && (
				<div className='browser-section'>
					<FileBrowser
						basePath={path}
						mode={mode}
						allowCreate={allowCreate}
						onConfirm={handleConfirm}
					/>
				</div>
			)}
		</div>
	);
}

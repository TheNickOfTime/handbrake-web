import { DirectoryTree } from 'directory-tree';
import FileBrowser from '../../../modules/file-browser/file-browser';
import './path-input.scss';
import { useState } from 'react';
import { FileBrowserMode } from '../../../../../../types/file-browser';

type Params = {
	id: string;
	label: string;
	tree: DirectoryTree | null;
	mode: FileBrowserMode;
	value: string | undefined;
	// setValue: React.Dispatch<React.SetStateAction<string | undefined>>;
	onConfirm?: (file: string) => void;
};

export default function PathInput({ id, label, tree, mode, value, onConfirm }: Params) {
	const [showTree, setShowTree] = useState(false);

	const handleConfirm = (file: string) => {
		if (onConfirm) {
			onConfirm(file);
		}
		setShowTree(false);
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
						setShowTree(!showTree);
					}}
					// onBlur={() => setShowTree(false)}
				>
					<span className='button-label'>{showTree ? 'Cancel' : 'Browse'}</span>
				</button>
			</div>
			{tree && showTree && (
				<div className='browser-section'>
					<FileBrowser tree={tree} mode={mode} onConfirm={handleConfirm} />
				</div>
			)}
		</div>
	);
}

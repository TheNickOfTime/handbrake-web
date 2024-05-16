import { DirectoryTree } from 'directory-tree';
import FileBrowser from '../../../file-browser/file-browser';
import ButtonInput from '../button/button-input';
import './path-input.scss';
import { useState } from 'react';

type Params = {
	id: string;
	label: string;
	tree: DirectoryTree | null;
	value: string;
	setValue: (value: string) => void;
};

export default function PathInput({ id, label, tree, value, setValue }: Params) {
	const [showTree, setShowTree] = useState(false);

	const onConfirm = (file: string) => {
		setValue(file);
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
				<input className='input-path-text' id={id} type='text' value={value} disabled />
				<ButtonInput
					label={showTree ? 'Cancel' : 'Browse'}
					color='blue'
					onClick={(event) => {
						event?.preventDefault();
						setShowTree(!showTree);
					}}
				/>
			</div>
			{tree && showTree && (
				<div className='browser-section'>
					<FileBrowser tree={tree} onConfirm={onConfirm} />
				</div>
			)}
		</div>
	);
}

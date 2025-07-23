import { useState } from 'react';
import FileBrowser from '~components/modules/file-browser';
import { DirectoryItemType } from '~types/directory';
import { FileBrowserMode } from '~types/file-browser';
import styles from './styles.module.scss';

type Params = {
	id: string;
	label: string;
	startPath: string;
	rootPath: string;
	mode: FileBrowserMode;
	allowClear?: boolean;
	allowCreate?: boolean;
	value: string;
	setValue?: (value: string) => void;
	onConfirm?: (item: DirectoryItemType) => void;
};

export default function PathInput({
	id,
	label,
	startPath,
	rootPath,
	mode,
	allowClear = false,
	allowCreate = false,
	value,
	setValue,
	onConfirm,
}: Params) {
	const [showFileBrowser, setShowFileBrowser] = useState(false);

	const handleClear = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		if (setValue) {
			setValue('');
			setShowFileBrowser(false);
		} else {
			console.error(
				`[client] Cannot reset path-input with id '${id}' because the 'setValue' parameter has not been set.`
			);
		}
	};

	const handleConfirm = (item: DirectoryItemType) => {
		if (onConfirm) {
			onConfirm(item);
		}
		setShowFileBrowser(false);
	};

	return (
		<div className={styles['path-input']}>
			<div className={styles['input-section']}>
				{label && (
					<label className={styles['input-label']} htmlFor={id}>
						{label.replace(/[:\s]+$/, '') + ':'}
					</label>
				)}
				<div className={styles['inputs']}>
					<input
						className={`${'input-path-text'} form-item`}
						id={id}
						type='text'
						value={value ? value : 'N/A'}
						size={1}
						disabled
					/>
					{allowClear && value && (
						<button
							className='controlled-button yellow reset'
							type='button'
							onClick={handleClear}
							heading='Clear Path'
						>
							<i className='bi bi-eraser-fill' />
						</button>
					)}
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
						<span className='button-label'>
							{showFileBrowser ? 'Cancel' : 'Browse'}
						</span>
					</button>
				</div>
			</div>
			{showFileBrowser && (
				<div className='browser-section'>
					<FileBrowser
						startPath={startPath}
						rootPath={rootPath}
						mode={mode}
						allowCreate={allowCreate}
						onConfirm={handleConfirm}
					/>
				</div>
			)}
		</div>
	);
}

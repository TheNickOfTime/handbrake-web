import { DirectoryItemType } from '@handbrake-web/shared/types/directory';
import { FileBrowserMode } from '@handbrake-web/shared/types/file-browser';
import ClearIcon from '@icons/eraser-fill.svg?react';
import { useState } from 'react';
import FileBrowser from '~components/modules/file-browser';
import ButtonInput from '../button';
import styles from './styles.module.scss';

interface Properties {
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
}

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
}: Properties) {
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
		<div className={`path-input ${styles['path-input']}`}>
			<div className={`input-section ${styles['input-section']}`}>
				{label && (
					<label className={styles['label']} htmlFor={id}>
						{label.replace(/[:\s]+$/, '') + ':'}
					</label>
				)}
				<div className={styles['inputs']}>
					<input
						className={styles['path-text']}
						id={id}
						type='text'
						value={value ? value : 'N/A'}
						size={1}
						disabled={true}
					/>
					{allowClear && value && (
						<ButtonInput
							className={styles['reset-button']}
							Icon={ClearIcon}
							color='yellow'
							title='Clear Path'
							onClick={handleClear}
						/>
					)}
					<ButtonInput
						className={styles['browse-button']}
						label={showFileBrowser ? 'Cancel' : 'Browse'}
						color='blue'
						onClick={(event) => {
							event.preventDefault();
							setShowFileBrowser(!showFileBrowser);
						}}
						onKeyDown={(event) => {
							event.preventDefault();
						}}
					/>
				</div>
			</div>
			{showFileBrowser && (
				<div className={`browser-section ${styles['browser-section']}`}>
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

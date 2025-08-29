import UpIcon from '@icons/arrow-90deg-up.svg?react';
import FileIcon from '@icons/file-earmark-fill.svg?react';
import FolderIcon from '@icons/folder-fill.svg?react';
import mime from 'mime';
import { DirectoryItemType, DirectoryType } from '~types/directory';
import { FileBrowserMode } from '~types/file-browser';
import styles from './styles.module.scss';

interface Properties {
	mode: FileBrowserMode;
	rootPath: string;
	directory: DirectoryType | null;
	updateDirectory: (newPath: string) => void;
	selectedItem: DirectoryItemType | undefined;
	setSelectedItem: React.Dispatch<React.SetStateAction<DirectoryItemType | undefined>>;
}

export default function FileBrowserBody({
	mode,
	rootPath,
	directory,
	updateDirectory,
	selectedItem,
	setSelectedItem,
}: Properties) {
	const onClickFile = (item: DirectoryItemType) => {
		switch (mode) {
			case FileBrowserMode.SingleFile:
				setSelectedItem(item);
				console.log(`[client] [file-browser] Selected item set to ${item.path}`);
				break;
			case FileBrowserMode.Directory:
				console.error(
					"[client] [file-browser] [error] You shouldn't be seeing single files in directory mode."
				);
				break;
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const onDoubleClickFile = (_item: DirectoryItemType) => {
		switch (mode) {
			case FileBrowserMode.SingleFile:
				break;
			case FileBrowserMode.Directory:
				console.error(
					"[client] [file-browser] [error] You shouldn't be seeing single files in directory mode."
				);
				break;
		}
	};

	const onClickFolder = (item: DirectoryItemType) => {
		switch (mode) {
			case FileBrowserMode.SingleFile:
				break;
			case FileBrowserMode.Directory:
				setSelectedItem(item);
				break;
		}
	};

	const onDoubleClickFolder = (item: DirectoryItemType) => {
		updateDirectory(item.path);
		if (mode == FileBrowserMode.Directory) {
			setSelectedItem(item);
		}
		console.log(`[client] [file-browser] Current path set to '${item.path}'.`);
	};

	return (
		<div className={styles['browser-body']}>
			{/* Show directory up button if  */}
			{directory && rootPath != directory.current.path && directory.parent && (
				<button
					className={styles['directory-item']}
					onClick={(event) => event.preventDefault()}
					onDoubleClick={(event) => {
						event.preventDefault();
						onDoubleClickFolder(directory.parent!);
					}}
				>
					<UpIcon className={styles['icon']} />
					<span className={styles['label']}>..</span>
				</button>
			)}
			{directory != null &&
				directory.items.map((child) => {
					const isSelected = selectedItem?.path == child.path;
					const mimeType = mime.getType(child.path);
					// console.log(mimeType);

					const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
						event.preventDefault();
						child.isDirectory ? onClickFolder(child) : onClickFile(child);
					};

					const onDoubleClick = (
						event: React.MouseEvent<HTMLButtonElement, MouseEvent>
					) => {
						event.preventDefault();
						child.isDirectory ? onDoubleClickFolder(child) : onDoubleClickFile(child);
					};

					const disabled =
						(!child.isDirectory && mode == FileBrowserMode.Directory) ||
						(!child.isDirectory && !mimeType?.includes('video'));

					return (
						<button
							className={styles['directory-item']}
							key={child.path + child.name + child.extension}
							onClick={onClick}
							onDoubleClick={onDoubleClick}
							disabled={disabled}
							data-selected={isSelected}
						>
							{child.isDirectory ? (
								<FolderIcon className={styles['icon']} />
							) : (
								<FileIcon className={styles['icon']} />
							)}
							<span className='label'>{child.name + child.extension}</span>
						</button>
					);
				})}
		</div>
	);
}

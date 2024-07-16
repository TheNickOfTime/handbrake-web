import mime from 'mime';
import { FileBrowserMode } from 'types/file-browser';
import { Directory, DirectoryItem } from 'types/directory';

type Params = {
	mode: FileBrowserMode;
	basePath: string;
	directory: Directory | null;
	updateDirectory: (newPath: string) => void;
	selectedItem: DirectoryItem | undefined;
	setSelectedItem: React.Dispatch<React.SetStateAction<DirectoryItem | undefined>>;
};

export default function FileBrowserBody({
	mode,
	basePath,
	directory,
	updateDirectory,
	selectedItem,
	setSelectedItem,
}: Params) {
	const onClickFile = (item: DirectoryItem) => {
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
	const onDoubleClickFile = (_item: DirectoryItem) => {
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

	const onClickFolder = (item: DirectoryItem) => {
		switch (mode) {
			case FileBrowserMode.SingleFile:
				break;
			case FileBrowserMode.Directory:
				setSelectedItem(item);
				break;
		}
	};

	const onDoubleClickFolder = (item: DirectoryItem) => {
		updateDirectory(item.path);
		console.log(`[client] [file-browser] Current path set to '${item.path}'.`);
	};

	return (
		<>
			{/* Show directory up button if  */}
			{directory && basePath != directory.current.path && directory.parent && (
				<button
					className='directory-item'
					onClick={(event) => event.preventDefault()}
					onDoubleClick={(event) => {
						event.preventDefault();
						onDoubleClickFolder(directory.parent!);
					}}
				>
					<i className='icon bi bi-arrow-90deg-up' />
					<span className='label'>..</span>
				</button>
			)}
			{directory != null &&
				directory.items.map((child) => {
					const isSelected = selectedItem?.path == child.path;
					// const isFile = child.children == undefined;
					const icon = child.isDirectory ? 'bi-folder-fill' : 'bi-file-earmark-fill';
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
							className={`directory-item ${isSelected ? 'selected' : ''}`}
							key={child.path + child.name + child.extension}
							onClick={onClick}
							onDoubleClick={onDoubleClick}
							disabled={disabled}
						>
							<i className={`icon bi ${icon}`} />
							<span className='label'>{child.name + child.extension}</span>
						</button>
					);
				})}
		</>
	);
}

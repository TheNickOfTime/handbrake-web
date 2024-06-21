import mime from 'mime';
import { FileBrowserMode } from '../../../../../../types/file-browser';
import { Directory } from '../../../../../../types/directory';

type Params = {
	mode: FileBrowserMode;
	basePath: string;
	directory: Directory | null;
	updateDirectory: (newPath: string) => void;
	selectedPath: string | undefined;
	setSelectedPath: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export default function FileBrowserBody({
	mode,
	basePath,
	directory,
	updateDirectory,
	selectedPath,
	setSelectedPath,
}: Params) {
	const onClickFile = (path: string) => {
		switch (mode) {
			case FileBrowserMode.SingleFile:
				setSelectedPath(path);
				console.log(`[client] [file-browser] Selected path set to ${path}`);
				break;
			case FileBrowserMode.Directory:
				console.error(
					"[client] [file-browser] [error] You shouldn't be seeing single files in directory mode."
				);
				break;
		}
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const onDoubleClickFile = (path: string) => {
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

	const onClickFolder = (path: string) => {
		switch (mode) {
			case FileBrowserMode.SingleFile:
				break;
			case FileBrowserMode.Directory:
				setSelectedPath(path);
				break;
		}
	};

	const onDoubleClickFolder = (path: string) => {
		updateDirectory(path);
		console.log(`[client] [file-browser] Current path set to '${path}'.`);
	};

	return (
		<>
			{/* Show directory up button if  */}
			{directory && basePath != directory.current && directory.parent && (
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
					const isSelected = selectedPath == child.path;
					// const isFile = child.children == undefined;
					const icon = child.isDirectory ? 'bi-folder-fill' : 'bi-file-earmark-fill';
					const mimeType = mime.getType(child.path);
					// console.log(mimeType);

					const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
						event.preventDefault();
						child.isDirectory ? onClickFolder(child.path) : onClickFile(child.path);
					};

					const onDoubleClick = (
						event: React.MouseEvent<HTMLButtonElement, MouseEvent>
					) => {
						event.preventDefault();
						child.isDirectory
							? onDoubleClickFolder(child.path)
							: onDoubleClickFile(child.path);
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

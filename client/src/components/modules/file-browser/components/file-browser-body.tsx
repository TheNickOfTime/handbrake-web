import mime from 'mime';
import { DirectoryTree } from 'directory-tree';
import { FileBrowserMode } from '../../../../../../types/file-browser';

type Params = {
	tree: DirectoryTree;
	mode: FileBrowserMode;
	parentPath: string;
	isSubdirectory: boolean;
	setCurrentPath: React.Dispatch<React.SetStateAction<string>>;
	selectedPath: string | undefined;
	setSelectedPath: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export default function FileBrowserBody({
	tree,
	mode,
	parentPath,
	isSubdirectory,
	setCurrentPath,
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
		setCurrentPath(path);
		console.log(`[client] [file-browser] Current path set to '${path}'.`);
	};

	return (
		<>
			{isSubdirectory && (
				<button
					className='directory-item'
					onClick={(event) => event.preventDefault()}
					onDoubleClick={(event) => {
						event.preventDefault();
						onDoubleClickFolder(parentPath);
					}}
				>
					<i className='icon bi bi-arrow-90deg-up' />
					<span className='label'>..</span>
				</button>
			)}
			{tree.children?.map((child) => {
				const isSelected = selectedPath == child.path;
				const isFile = child.children == undefined;
				const icon = isFile ? 'bi-file-earmark-fill' : 'bi-folder-fill';
				const mimeType = mime.getType(child.path);
				// console.log(mimeType);

				const onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
					event.preventDefault();
					isFile ? onClickFile(child.path) : onClickFolder(child.path);
				};

				const onDoubleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
					event.preventDefault();
					isFile ? onDoubleClickFile(child.path) : onDoubleClickFolder(child.path);
				};

				const disabled =
					(isFile && mode == FileBrowserMode.Directory) ||
					(isFile && !mimeType?.includes('video'));

				return (
					<button
						className={`directory-item ${isSelected ? 'selected' : ''}`}
						key={child.path}
						onClick={onClick}
						onDoubleClick={onDoubleClick}
						disabled={disabled}
					>
						<i className={`icon bi ${icon}`} />
						<span className='label'>{child.name}</span>
					</button>
				);
			})}
		</>
	);
}

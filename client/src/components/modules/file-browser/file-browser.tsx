/* eslint-disable react-hooks/exhaustive-deps */
import ButtonInput from 'components/base/inputs/button/button-input';
import { PrimaryOutletContextType } from 'pages/primary/context';
import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
	CreateDirectoryRequestType,
	DirectoryItemType,
	DirectoryRequestType,
	DirectoryType,
} from 'types/directory';
import { FileBrowserMode } from 'types/file-browser';
import AddDirectory from './components/file-browser-add-directory';
import FileBrowserBody from './components/file-browser-body';
import './file-browser.scss';

type Params = {
	startPath: string;
	rootPath: string;
	mode: FileBrowserMode;
	allowCreate: boolean;
	onConfirm: (item: DirectoryItemType) => void;
};

export default function FileBrowser({ startPath, rootPath, mode, allowCreate, onConfirm }: Params) {
	const { socket } = useOutletContext<PrimaryOutletContextType>();

	const [currentPath, setCurrentPath] = useState(startPath);
	const [selectedItem, setSelectedItem] = useState<DirectoryItemType>();
	const [directory, setDirectory] = useState<DirectoryType | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [createNewItem, setCreateNewItem] = useState(false);

	const requestDirectory = async (path: string, isRecursive: boolean = false) => {
		setIsLoading(true);
		console.log(`[client] Requesting directory ${path}...`);
		const request: DirectoryRequestType = {
			path: path,
			isRecursive: isRecursive,
		};
		const response: DirectoryType = await socket.emitWithAck('get-directory', request);
		console.log(
			`[client] Received directory ${response.current.path} with ${response.items.length} items.`
		);
		setIsLoading(false);
		setDirectory(response);
		return response;
	};

	useEffect(() => {
		async function InitDirectory() {
			const newDirectory = await requestDirectory(currentPath);
			if (mode == FileBrowserMode.Directory && !selectedItem) {
				setSelectedItem(newDirectory.current);
			}
		}
		InitDirectory();
	}, []);

	const handleUpdateDirectory = (newPath: string) => {
		requestDirectory(newPath);
		setCurrentPath(newPath);
	};

	const selectedFileLabel =
		mode == FileBrowserMode.SingleFile
			? 'Selected File:'
			: mode == FileBrowserMode.Directory
			? 'Selected Directory:'
			: '';

	const handleAddDirectoryButton = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		setCreateNewItem(true);
	};

	const handleAddDirectoryCancel = () => {
		setCreateNewItem(false);
	};

	const handleAddDirectorySubmit = async (directoryName: string) => {
		const request: CreateDirectoryRequestType = {
			path: currentPath,
			name: directoryName,
		};
		const result = await socket.emitWithAck('make-directory', request);
		setCreateNewItem(false);
		if (result) {
			requestDirectory(currentPath);
		}
	};

	const handleConfirmButton = async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		if (selectedItem) {
			onConfirm(selectedItem);
		} else {
			console.error('[client] [error] Cannot confirm, there is no selected path.');
		}
	};

	return (
		<div className='file-browser'>
			<div className='file-browser-header'>
				<div className='current-path'>
					<span>{currentPath}</span>
					{isLoading && <span> (Loading...)</span>}
				</div>
				{mode == FileBrowserMode.Directory && allowCreate && (
					<button
						className='add-directory'
						title='Add New Directory'
						onClick={handleAddDirectoryButton}
						onKeyDown={(event) => {
							event.preventDefault();
						}}
					>
						<i className='bi bi-folder-plus' />
					</button>
				)}
			</div>
			<div className='file-browser-main'>
				<div className='file-browser-body'>
					<FileBrowserBody
						mode={mode}
						rootPath={rootPath}
						directory={directory}
						updateDirectory={handleUpdateDirectory}
						selectedItem={selectedItem}
						setSelectedItem={setSelectedItem}
					/>
				</div>
				<div className='file-browser-footer'>
					<div className='selected-file'>
						<span className='selected-file-label'>{selectedFileLabel}</span>
						<span className='selected-file-path'>
							{selectedItem ? selectedItem.path : 'N/A'}
						</span>
						<ButtonInput
							label='Confirm'
							color='green'
							onClick={handleConfirmButton}
							disabled={selectedItem == undefined}
						/>
					</div>
				</div>
				{directory && createNewItem && (
					<AddDirectory
						existingItems={directory.items}
						onCancel={handleAddDirectoryCancel}
						onSubmit={handleAddDirectorySubmit}
					/>
				)}
			</div>
		</div>
	);
}

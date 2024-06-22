/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { FileBrowserMode } from '../../../../../types/file-browser';
import { Directory, DirectoryItem } from '../../../../../types/directory';
import ButtonInput from '../../base/inputs/button/button-input';
import FileBrowserBody from './components/file-browser-body';
import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from '../../../pages/primary/primary-context';
import './file-browser.scss';

type Params = {
	basePath: string;
	mode: FileBrowserMode;
	onConfirm: (item: DirectoryItem) => void;
};

export default function FileBrowser({ basePath, mode, onConfirm }: Params) {
	const { socket } = useOutletContext<PrimaryOutletContextType>();

	const [currentPath, setCurrentPath] = useState(basePath);
	const [selectedItem, setSelectedItem] = useState<DirectoryItem>();
	const [directory, setDirectory] = useState<Directory | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const requestDirectory = async (path: string) => {
		setIsLoading(true);
		console.log(`[client] Requesting directory ${path}...`);
		const response: Directory = await socket.emitWithAck('get-directory', path);
		console.log(
			`[client] Received directory ${response.current.path} with ${response.items.length} items.`
		);
		// console.log(response);
		setIsLoading(false);
		setDirectory(response);
		return response;
	};

	useEffect(() => {
		requestDirectory(currentPath);
	}, []);

	const handleUpdateDirectory = (newPath: string) => {
		const newSelectedItem = directory?.items.find((item) => newPath == item.path);
		console.log(newSelectedItem);
		requestDirectory(newPath);
		setCurrentPath(newPath);
	};

	const selectedFileLabel =
		mode == FileBrowserMode.SingleFile
			? 'Selected File:'
			: mode == FileBrowserMode.Directory
			? 'Selected Directory:'
			: '';

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
				<span>{currentPath}</span>
				{isLoading && <span> (Loading...)</span>}
			</div>
			<div className='file-browser-body'>
				<FileBrowserBody
					mode={mode}
					basePath={basePath}
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
		</div>
	);
}

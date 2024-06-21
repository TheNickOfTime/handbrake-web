/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { FileBrowserMode } from '../../../../../types/file-browser';
import { Directory } from '../../../../../types/directory';
import ButtonInput from '../../base/inputs/button/button-input';
import FileBrowserBody from './components/file-browser-body';
import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from '../../../pages/primary/primary-context';
import './file-browser.scss';

type Params = {
	basePath: string;
	mode: FileBrowserMode;
	onConfirm: (path: string) => void;
};

export default function FileBrowser({ basePath, mode, onConfirm }: Params) {
	const { socket } = useOutletContext<PrimaryOutletContextType>();

	const [currentPath, setCurrentPath] = useState(basePath);
	const [selectedPath, setSelectedPath] = useState<string | undefined>(
		mode == FileBrowserMode.Directory ? basePath : undefined
	);

	const [directory, setDirectory] = useState<Directory | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const requestDirectory = (path: string) => {
		console.log(`[client] Requesting directory ${path}...`);
		socket.emit('get-directory', path);
		setIsLoading(true);
	};

	const onGetDirectory = (newDirectory: Directory) => {
		console.log(`[client] Received directory ${newDirectory.current}.`);
		setDirectory(newDirectory);
		setIsLoading(false);
	};

	useEffect(() => {
		socket.on('get-directory', onGetDirectory);

		return () => {
			socket.off('get-directory', onGetDirectory);
		};
	}, []);

	useEffect(() => {
		requestDirectory(currentPath);
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

	const handleConfirmButton = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		onConfirm(selectedPath!);
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
					selectedPath={selectedPath}
					setSelectedPath={setSelectedPath}
				/>
			</div>
			<div className='file-browser-footer'>
				<div className='selected-file'>
					<span className='selected-file-label'>{selectedFileLabel}</span>
					<span className='selected-file-path'>
						{selectedPath ? selectedPath : 'N/A'}
					</span>
					<ButtonInput
						label='Confirm'
						color='green'
						onClick={handleConfirmButton}
						disabled={selectedPath == undefined}
					/>
				</div>
			</div>
		</div>
	);
}

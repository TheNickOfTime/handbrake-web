/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { DirectoryTree } from 'directory-tree';

import { FileBrowserContext } from './file-browser-context';
import FileBrowserToolbar from './components/file-browser-toolbar';
import FileBrowserBody from './components/file-browser-body';
import './file-browser.scss';
import FileBrowserSelection from './components/file-browser-selection';

type Params = {
	socket: Socket;
	onConfirm: React.Dispatch<React.SetStateAction<string>>;
};

export default function FileBrowser({ socket, onConfirm }: Params) {
	const [directoryTree, setDirectoryTree] = useState<null | DirectoryTree>(null);
	const [basePath, setBasePath] = useState('');
	const [basePathName, setBasePathName] = useState('');
	const [currentPath, setCurrentPath] = useState('');
	const [selectedFile, setSelectedFile] = useState('');

	const onGetDirectoryTree = (tree: DirectoryTree) => {
		setDirectoryTree(tree);
		setBasePath(tree.path);
		setBasePathName(tree.name);
		setCurrentPath(tree.path);
	};

	useEffect(() => {
		socket.on('get-directory-tree', onGetDirectoryTree);

		return () => {
			socket.off('get-directory-tree', onGetDirectoryTree);
		};
	}, []);

	useEffect(() => {
		socket.emit('get-directory-tree');
	}, []);

	const context = {
		basePath: basePath,
		basePathName: basePathName,
	};

	if (directoryTree) {
		return (
			<div className='file-browser bg'>
				<FileBrowserContext.Provider value={context}>
					<div>
						<FileBrowserToolbar path={currentPath} />
						<FileBrowserBody
							tree={directoryTree}
							currentPath={currentPath}
							setCurrentPath={setCurrentPath}
							setSelectedFile={setSelectedFile}
						/>
						<FileBrowserSelection selectedFile={selectedFile} onConfirm={onConfirm} />
					</div>
				</FileBrowserContext.Provider>
			</div>
		);
	}
}

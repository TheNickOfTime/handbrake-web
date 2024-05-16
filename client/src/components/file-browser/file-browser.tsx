/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import { DirectoryTree } from 'directory-tree';

import { FileBrowserContext } from './file-browser-context';
import FileBrowserToolbar from './components/file-browser-toolbar';
import FileBrowserBody from './components/file-browser-body';
import './file-browser.scss';
import FileBrowserSelection from './components/file-browser-selection';

type Params = {
	tree: DirectoryTree;
	onConfirm: (file: string) => void;
};

export default function FileBrowser({ tree, onConfirm }: Params) {
	// const [directoryTree, setDirectoryTree] = useState<null | DirectoryTree>(null);
	const [basePath] = useState(tree.path);
	const [basePathName] = useState(tree.name);
	const [currentPath, setCurrentPath] = useState(tree.path);
	const [selectedFile, setSelectedFile] = useState('N/A');

	const context = {
		basePath: basePath,
		basePathName: basePathName,
	};

	return (
		<div className='file-browser bg'>
			<FileBrowserContext.Provider value={context}>
				<div>
					<FileBrowserToolbar path={currentPath} />
					<FileBrowserBody
						tree={tree}
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

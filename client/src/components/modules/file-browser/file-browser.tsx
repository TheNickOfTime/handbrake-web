/* eslint-disable react-hooks/exhaustive-deps */
import { useState } from 'react';
import { DirectoryTree } from 'directory-tree';

import { FileBrowserContext } from './file-browser-context';
import { getCurrentPathTree } from './file-browser-utils';
import { FileBrowserMode } from '../../../../../types/file-browser';
import './file-browser.scss';
import ButtonInput from '../../base/inputs/button/button-input';
import FileBrowserBody from './components/file-browser-body';

type Params = {
	tree: DirectoryTree;
	mode: FileBrowserMode;
	onConfirm: (path: string) => void;
};

export default function FileBrowser({ tree, mode, onConfirm }: Params) {
	const [basePath] = useState(tree.path);
	const [basePathName] = useState(tree.name);
	const [currentPath, setCurrentPath] = useState(tree.path);
	const [selectedPath, setSelectedPath] = useState<string | undefined>(
		mode == FileBrowserMode.Directory ? tree.path : undefined
	);

	const context = {
		basePath: basePath,
		basePathName: basePathName,
	};

	const currentTree = getCurrentPathTree(currentPath, basePath, tree);
	const parentPath = currentPath.replace(new RegExp(`/${currentTree.name}$`), '');

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

	// const handleFileDoubleClick = () => {
	// 	onConfirm(selectedPaths);
	// }

	return (
		<div className='file-browser'>
			<FileBrowserContext.Provider value={context}>
				<div className='file-browser-header'>{currentPath}</div>
				<div className='file-browser-body'>
					<FileBrowserBody
						tree={currentTree}
						mode={mode}
						parentPath={parentPath}
						isSubdirectory={currentPath != basePath}
						setCurrentPath={setCurrentPath}
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
			</FileBrowserContext.Provider>
		</div>
	);
}

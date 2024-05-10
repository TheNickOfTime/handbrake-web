import { DirectoryTree } from 'directory-tree';
import DirectoryItem from './directory-item';
import { getCurrentPathTree } from '../file-browser-utils';
import { useContext } from 'react';
import { FileBrowserContext } from '../file-browser-context';

type Params = {
	tree: DirectoryTree;
	currentPath: string;
	setCurrentPath: React.Dispatch<React.SetStateAction<string>>;
};

export default function DirectoryDisplay({ tree, currentPath, setCurrentPath }: Params) {
	const context = useContext(FileBrowserContext);
	const currentTree = getCurrentPathTree(currentPath, context.basePath, tree);
	const parentPath = currentPath.replace(new RegExp(`/${currentTree.name}$`), '');

	return (
		<div id='directory'>
			{currentPath != tree.path && (
				<DirectoryItem
					name='..'
					icon='bi-arrow-90deg-up'
					onClick={() => setCurrentPath(parentPath)}
				/>
			)}
			{currentTree.children?.map((child) => {
				const isDirectory = child.children != undefined;
				const icon = isDirectory ? 'bi-folder-fill' : 'bi-file-earmark-fill';
				const onClick = isDirectory
					? () => setCurrentPath(child.path)
					: () => console.log('wow');
				return <DirectoryItem name={child.name} icon={icon} onClick={onClick} />;
			})}
		</div>
	);
}

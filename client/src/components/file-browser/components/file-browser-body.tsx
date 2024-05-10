import { DirectoryTree } from 'directory-tree';
import DirectoryDisplay from './directory-display';

type Params = {
	tree: DirectoryTree;
	currentPath: string;
	setCurrentPath: React.Dispatch<React.SetStateAction<string>>;
};

export default function FileBrowserBody({ tree, currentPath, setCurrentPath }: Params) {
	return (
		<div className='file-browser-body'>
			<DirectoryDisplay
				tree={tree}
				currentPath={currentPath}
				setCurrentPath={setCurrentPath}
			/>
		</div>
	);
}

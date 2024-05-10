import fs from 'fs';
import directoryTree from 'directory-tree';

export function GetDirectoryTree(path: string) {
	const tree = directoryTree(path);
	// console.log(tree);
	return tree;
}

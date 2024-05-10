import { DirectoryTree } from 'directory-tree';

export const getRelativePath = (absolutePath: string, basePath: string) => {
	return absolutePath.replace(new RegExp(`^${basePath}`), '');
};

export const getCurrentPathTree = (
	absolutePath: string,
	basePath: string,
	tree: DirectoryTree
): DirectoryTree => {
	if (basePath == absolutePath) {
		console.log('root path');
		return tree;
	}

	const currentRelativePath = getRelativePath(absolutePath, basePath).replace(
		new RegExp(`^${basePath}`),
		''
	);
	const splitPath = currentRelativePath.split('/');
	console.log(splitPath);
	let pathIndex = 1;
	let childTree: DirectoryTree = tree;
	const recurseTree = (key: string, tree: DirectoryTree) => {
		const validChildren = tree.children?.filter((child) => child.children != undefined);
		for (const child of validChildren!) {
			const nameIsKey = child.name == key;
			console.log(child.name, key, nameIsKey);
			if (nameIsKey) {
				pathIndex += 1;
				const nextKey = splitPath[pathIndex];
				if (nextKey) {
					recurseTree(nextKey, child);
				} else {
					// console.log(child);
					childTree = child;
				}
			}
		}
	};
	recurseTree(splitPath[pathIndex], tree);
	return childTree!;
};

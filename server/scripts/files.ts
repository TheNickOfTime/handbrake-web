import fs from 'fs/promises';
import path from 'path';
import directoryTree from 'directory-tree';
import { Directory, DirectoryItem, DirectoryItems } from '../../types/directory';

export function GetDirectoryTree(path: string) {
	const tree = directoryTree(path);
	return tree;
}

export async function GetDirectoryItems(absolutePath: string, recursive: boolean = false) {
	try {
		// Get directory
		const dir = await fs.readdir(absolutePath, {
			encoding: 'utf-8',
			withFileTypes: true,
			recursive: recursive,
		});

		// Make parent item
		const parentPath = path.resolve(absolutePath, '..');
		const parentItem: DirectoryItem | undefined =
			parentPath == absolutePath
				? undefined
				: {
						path: parentPath,
						name: path.dirname(parentPath),
						isDirectory: true,
				  };

		// Make current item
		const currentItem: DirectoryItem = {
			path: absolutePath,
			name: path.dirname(absolutePath),
			isDirectory: true,
		};

		// Make directory items
		const items: DirectoryItems = dir.map((item) => {
			const parsedName = path.parse(item.name);
			return {
				path: path.join(item.path, item.name),
				name: parsedName.name,
				extension: parsedName.ext,
				isDirectory: item.isDirectory(),
			};
		});

		// Build directory object
		const result: Directory = {
			parent: parentPath != absolutePath ? parentItem : undefined,
			current: currentItem,
			items: items,
		};
		// console.log(result);
		return result;
	} catch (err) {
		console.error(err);
	}
}

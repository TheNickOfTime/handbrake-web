import fs from 'fs/promises';
import path from 'path';
import { DirectoryType, DirectoryItemType, DirectoryItemsType } from 'types/directory.types';

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
		const parentItem: DirectoryItemType | undefined =
			parentPath == absolutePath
				? undefined
				: {
						path: parentPath,
						name: path.dirname(parentPath),
						isDirectory: true,
				  };

		// Make current item
		const currentItem: DirectoryItemType = {
			path: absolutePath,
			name: path.dirname(absolutePath),
			isDirectory: true,
		};

		// Make directory items
		const items: DirectoryItemsType = dir.map((item) => {
			const parsedName = path.parse(item.name);
			return {
				path: path.join(item.path, item.name),
				name: parsedName.name,
				extension: parsedName.ext,
				isDirectory: item.isDirectory(),
			};
		});

		// Build directory object
		const result: DirectoryType = {
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

export async function MakeDirectory(directoryPath: string, directoryName: string) {
	try {
		// Check if the program has write permissions in the parent dir
		await fs.access(directoryPath, fs.constants.W_OK);

		// Get parent directory permissions to copy to new directory
		const parentMode = (await fs.stat(directoryPath)).mode;

		// Make new directory
		const fullPath = path.join(directoryPath, directoryName);
		await fs.mkdir(fullPath, { mode: parentMode, recursive: false });
		return true;
	} catch (err) {
		console.error(err);
		return false;
	}
}

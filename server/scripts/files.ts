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

export async function CheckFilenameCollision(path: string, newItems: DirectoryItemsType) {
	const directory = await GetDirectoryItems(path);
	const existingItems = directory ? directory.items : [];
	const fileCollisions: { [index: string]: number[] } = {};

	newItems.forEach((newItem, newItemIndex) => {
		// Init fileCollisions object with an empty array
		fileCollisions[newItem.name] = [];

		// Check for collisions against existing files
		existingItems.forEach((existingItem) => {
			if (newItem.name + newItem.extension == existingItem.name + existingItem.extension) {
				fileCollisions[newItem.name].push(newItemIndex);
				console.log(
					`[server] [files] '${
						newItem.name + newItem.extension
					}' collides with existing file '${
						existingItem.name + existingItem.extension
					}' at the output path.`
				);
				return;
			}
		});

		// Check for collisions against other output files that may now have the same name
		newItems
			.filter((_, index) => index != newItemIndex)
			.forEach((otherNewItem) => {
				if (
					newItem.name == otherNewItem.name &&
					!fileCollisions[newItem.name].includes(newItemIndex)
				) {
					fileCollisions[newItem.name].push(newItemIndex);
					console.log(
						`[server] [files] ${
							newItem.name + newItem.extension
						} collides with another output ${
							otherNewItem.name + otherNewItem.extension
						}`
					);
					return;
				}
			});
	});

	const renamedItems: DirectoryItemsType = JSON.parse(JSON.stringify(newItems));
	Object.values(fileCollisions).forEach((collisionArray) => {
		let fileIndex = 1;
		collisionArray.forEach((value) => {
			// Increment the file index while a filename with the appended index exists either in the existing or renamed files
			while (
				existingItems
					.map((existingItem) => existingItem.name + existingItem.extension)
					.includes(
						renamedItems[value].name + `_${fileIndex}` + renamedItems[value].extension
					) ||
				renamedItems
					.map((item) => item.name)
					.includes(renamedItems[value].name + `_${fileIndex}`)
			) {
				fileIndex += 1;
			}

			const newName = renamedItems[value].name + `_${fileIndex}`;
			renamedItems[value].name = newName;
		});
	});

	return renamedItems;
}

import fs from 'fs/promises';
import path from 'path';
import { DirectoryType, DirectoryItemType, DirectoryItemsType } from 'types/directory';
import { GetQueue, JobForAvailableWorkers } from './queue';
import { TranscodeStage } from 'types/transcode';

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

export async function CheckFilenameCollision(existingDir: string, newItems: DirectoryItemsType) {
	const directory = await GetDirectoryItems(existingDir);
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
						`[server] [files] '${
							newItem.name + newItem.extension
						}' collides with another output '${
							otherNewItem.name + otherNewItem.extension
						}'`
					);
					return;
				}
			});

		// Check for collisions against waiting jobs in the queue (files don't exist yet)
		Object.values(GetQueue())
			.filter((job) => job.status.stage == TranscodeStage.Waiting)
			.map((job) => job.output)
			.forEach((waitingItem) => {
				if (
					waitingItem == newItem.path &&
					!fileCollisions[newItem.name].includes(newItemIndex)
				) {
					fileCollisions[newItem.name].push(newItemIndex);
					console.log(
						`[server] [files] '${
							newItem.name + newItem.extension
						}' collides with a pending job '${path.basename(waitingItem)}'`
					);
					return;
				}
			});
	});

	const renamedItems: DirectoryItemsType = JSON.parse(JSON.stringify(newItems));
	Object.values(fileCollisions).forEach((collisionArray) => {
		let fileIndex = 1;
		collisionArray.forEach((value) => {
			const renamedItem = renamedItems[value];
			// Increment the file index while a filename with the appended index exists either in the existing or renamed files
			while (
				existingItems
					.map((existingItem) => existingItem.name + existingItem.extension)
					.includes(renamedItem.name + `_${fileIndex}` + renamedItem.extension) ||
				Object.values(GetQueue())
					.filter((job) => job.status.stage == TranscodeStage.Waiting)
					.map((job) => path.basename(job.output))
					.includes(renamedItem.name + `_${fileIndex}` + renamedItem.extension) ||
				renamedItems.map((item) => item.name).includes(renamedItem.name + `_${fileIndex}`)
			) {
				fileIndex += 1;
			}

			const newName = renamedItem.name + `_${fileIndex}`;
			const newPath =
				path.join(path.dirname(renamedItem.path), newName) + renamedItem.extension;
			renamedItems[value].name = newName;
			renamedItems[value].path = newPath;
		});
	});

	return renamedItems;
}

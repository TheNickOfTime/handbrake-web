import fs from 'fs/promises';
import path from 'path';
import directoryTree from 'directory-tree';
import { Directory, DirectoryItems } from '../../types/directory';

export function GetDirectoryTree(path: string) {
	const tree = directoryTree(path);
	return tree;
}

export async function GetDirectoryItems(absolutePath: string, recursive: boolean = false) {
	try {
		const dir = await fs.readdir(absolutePath, {
			encoding: 'utf-8',
			withFileTypes: true,
			recursive: recursive,
		});
		const parent = path.resolve(absolutePath, '..');
		const items: DirectoryItems = dir.map((item) => {
			const parsedName = path.parse(item.name);
			return {
				path: path.join(item.path, item.name),
				name: parsedName.name,
				extension: parsedName.ext,
				isDirectory: item.isDirectory(),
			};
		});
		const result: Directory = {
			parent: parent != absolutePath ? parent : undefined,
			current: absolutePath,
			items: items,
		};
		console.log(result);
		return result;
	} catch (err) {
		console.error(err);
	}
}

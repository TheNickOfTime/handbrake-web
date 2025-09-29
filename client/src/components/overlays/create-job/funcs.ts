import {
	DirectoryItemsType,
	DirectoryRequestType,
	DirectoryType,
} from '@handbrake-web/shared/types/directory';
import { HandbrakeOutputExtensions } from '@handbrake-web/shared/types/file-extensions';
import mime from 'mime';
import { Socket } from 'socket.io-client';

export async function RequestDirectory(socket: Socket, path: string, isRecursive: boolean = false) {
	const request: DirectoryRequestType = {
		path: path,
		isRecursive: isRecursive,
	};
	const response: DirectoryType = await socket.emitWithAck('get-directory', request);
	return response;
}

export function FilterVideoFiles(items: DirectoryItemsType) {
	return items
		.filter((item) => !item.isDirectory)
		.filter((item) => mime.getType(item.path)?.includes('video'));
}

export function GetOutputItemsFromInputItems(
	inputItems: DirectoryItemsType,
	extension: HandbrakeOutputExtensions
) {
	return inputItems.map((item) => {
		return {
			path: item.path.replace(item.extension!, extension),
			name: item.name,
			extension: extension,
			isDirectory: item.isDirectory,
		};
	});
}

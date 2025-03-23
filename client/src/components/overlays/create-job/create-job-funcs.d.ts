import { Socket } from 'socket.io-client';
import { DirectoryType, DirectoryItemsType } from 'types/directory';
import { HandbrakeOutputExtensions } from 'types/file-extensions';
export declare function RequestDirectory(socket: Socket, path: string, isRecursive?: boolean): Promise<DirectoryType>;
export declare function FilterVideoFiles(items: DirectoryItemsType): import("types/directory").DirectoryItemType[];
export declare function GetOutputItemsFromInputItems(inputItems: DirectoryItemsType, extension: HandbrakeOutputExtensions): {
    path: string;
    name: string;
    extension: HandbrakeOutputExtensions;
    isDirectory: boolean;
}[];

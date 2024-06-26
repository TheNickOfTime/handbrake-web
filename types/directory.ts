export type DirectoryItem = {
	path: string;
	name: string;
	extension?: string;
	isDirectory: boolean;
};

export type DirectoryItems = DirectoryItem[];

export type Directory = {
	parent?: DirectoryItem;
	current: DirectoryItem;
	items: DirectoryItem[];
};

export type DirectoryRequest = {
	path: string;
	isRecursive: boolean;
};

export type CreateDirectoryRequest = {
	path: string;
	name: string;
};

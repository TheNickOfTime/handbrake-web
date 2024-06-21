export type DirectoryItem = {
	name: string;
	path: string;
	isDirectory: boolean;
};

export type DirectoryItems = DirectoryItem[];

export type Directory = {
	parent?: string;
	current: string;
	items: DirectoryItem[];
};

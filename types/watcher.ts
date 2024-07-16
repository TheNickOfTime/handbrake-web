export type Watcher = {
	watch_path: string;
	output_path?: string;
};

export type WatcherWithRowID = {
	rowid: number;
} & Watcher;

export type Watchers = Watcher[];

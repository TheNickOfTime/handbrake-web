export type Watcher = {
	watch_path: string;
	output_path?: string;
	preset_id: string;
	// enabled: 0 | 1;
};

export type WatcherWithRowID = {
	rowid: number;
} & Watcher;

// export type Watchers = Watcher[];

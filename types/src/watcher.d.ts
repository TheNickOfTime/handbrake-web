export type WatcherDefinitionType = {
	watch_path: string;
	output_path?: string;
	preset_id: string;
	// enabled: 0 | 1;
};

export type WatcherDefinitionWithIDType = {
	rowid: number;
} & WatcherDefinitionType;

// export type Watchers = Watcher[];

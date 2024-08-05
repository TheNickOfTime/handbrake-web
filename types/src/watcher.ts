export enum WatcherRuleMaskMethods {
	Include,
	Exclude,
}

export enum WatcherRuleBaseMethods {
	FileInfo,
	MediaInfo,
}

export enum WatcherRuleFileInfoMethods {
	FileName,
	FileExtension,
	FileSize,
}

export enum WatcherRuleMediaInfoMethods {
	MediaResoluition,
	MediaBitrate,
	MediaContainer,
	MediaEncoder,
}

export enum WatcherRuleComparisonMethods {
	String,
	Number,
}

export enum WatcherRuleStringComparisonMethods {
	EqualTo,
	Contains,
	RegularExpression,
}

export enum WatcherRuleNumberComparisonMethods {
	LessThan,
	LessThanOrEqualTo,
	EqualTo,
	GreaterThanOrEqualTo,
	GreaterThan,
}

export type WatcherRuleDefinitionType = {
	name: string;
	mask: WatcherRuleMaskMethods;
	base_rule_method: WatcherRuleBaseMethods;
	rule_method: WatcherRuleFileInfoMethods | WatcherRuleMediaInfoMethods;
	base_comparison_method: WatcherRuleComparisonMethods;
	comparison_method: WatcherRuleStringComparisonMethods | WatcherRuleNumberComparisonMethods;
	comparison: string | number;
};

export type WatcherDefinitionType = {
	watch_path: string;
	output_path?: string;
	preset_id: string;
	default_mask: WatcherRuleMaskMethods;
	rules: WatcherRuleDefinitionType[];
};

export type WatcherDefinitionWithIDType = {
	rowid: number;
} & WatcherDefinitionType;

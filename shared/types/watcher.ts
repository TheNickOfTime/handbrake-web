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
	MediaWidth,
	MediaHeight,
	MediaBitrate,
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

export const WatcherRuleComparisonLookup: { [index: string]: number } = {
	FileName: WatcherRuleComparisonMethods.String,
	FileExtension: WatcherRuleComparisonMethods.String,
	FileSize: WatcherRuleComparisonMethods.Number,
	MediaWidth: WatcherRuleComparisonMethods.Number,
	MediaHeight: WatcherRuleComparisonMethods.Number,
	MediaBitrate: WatcherRuleComparisonMethods.Number,
	MediaContainer: WatcherRuleComparisonMethods.String,
	MediaEncoder: WatcherRuleComparisonMethods.String,
};

export type WatcherRuleDefinitionType = {
	name: string;
	mask: WatcherRuleMaskMethods;
	base_rule_method: WatcherRuleBaseMethods;
	rule_method: WatcherRuleFileInfoMethods | WatcherRuleMediaInfoMethods;
	comparison_method: WatcherRuleStringComparisonMethods | WatcherRuleNumberComparisonMethods;
	comparison: string;
};

export type WatcherRuleDefinitionObjectType = {
	[index: number]: WatcherRuleDefinitionType;
};

export type WatcherDefinitionType = {
	watch_path: string;
	output_path: string | null;
	preset_id: string;
	// default_mask: WatcherRuleMaskMethods;
};

export type WatcherDefinitionWithRulesType = WatcherDefinitionType & {
	rules: WatcherRuleDefinitionObjectType;
};

export type WatcherDefinitionObjectType = {
	[index: number]: WatcherDefinitionWithRulesType;
};

export type WatcherDefinitionWithIDType = {
	id: number;
} & WatcherDefinitionType;

export type ConfigType = {
	paths: ConfigPathsType;
	presets: ConfigPresetsType;
};

export type ConfigPathsType = {
	'media-path': string;
	'input-path': string;
	'output-path': string;
};

export type ConfigPresetsType = {
	'show-default-presets': boolean;
	'allow-preset-creator': boolean;
};

export type ConfigValidationType = {
	[Section in keyof ConfigType]: {
		isValid: boolean;
		properties: {
			[Property in keyof ConfigType[Section]]: {
				isValid: boolean;
				value: ConfigType[Section][Property];
			};
		};
	};
};

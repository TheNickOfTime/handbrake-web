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

// export type ConfigValidationType = {
// 	[Property in keyof ConfigType]: {
// 		isValid: boolean;
// 		children: {
// 			[SubProperty in keyof ConfigType[Property]]: boolean;
// 		};
// 	};
// };

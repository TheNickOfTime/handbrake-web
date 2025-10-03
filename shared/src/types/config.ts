export type UnknownConfigType = Record<string, Record<string, unknown>>;

export interface ConfigType extends UnknownConfigType {
	config: {
		version: number;
	};
	paths: {
		'media-path': string;
		'input-path': string;
		'output-path': string;
	};
	presets: {
		'show-default-presets': boolean;
		'allow-preset-creator': boolean;
	};
	application: {
		'queue-startup-behavior': QueueStartupBehavior;
		'update-check-interval': number;
	};
}

// Config property enums ---------------------------------------------------------------------------
export enum QueueStartupBehavior {
	Previous,
	Active,
	Stopped,
}

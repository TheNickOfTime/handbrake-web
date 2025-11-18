export interface WorkerProperties {
	version: WorkerVersion;
	capabilities: WorkerCapabilities;
}

export interface WorkerVersion {
	handbrake: string;
	application: string;
}

export interface WorkerCapabilities {
	cpu: boolean;
	qsv: boolean;
	nvenc: boolean;
	vcn: boolean;
}

export enum TranscodeStage {
	Waiting,
	Scanning,
	Transcoding,
	Finished,
	Stopped,
}

export type TranscodeInfo = {
	percentage: string;
	eta?: string;
	currentFPS?: number;
	averageFPS?: number;
};

export type TranscodeStatus = {
	stage: TranscodeStage;
	info: TranscodeInfo;
};

export type TranscodeStatusUpdate = {
	id: string;
	status: TranscodeStatus;
};

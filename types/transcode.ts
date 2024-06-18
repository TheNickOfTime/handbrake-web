export enum TranscodeStage {
	Waiting,
	Scanning,
	Transcoding,
	Finished,
	Stopped,
}

export type TranscodeInfo = {
	percentage: string;
	currentFPS?: string;
	averageFPS?: string;
	eta?: string;
};

export type TranscodeStatus = {
	stage: TranscodeStage;
	info: TranscodeInfo;
};

export type TranscodeStatusUpdate = {
	id: string;
	status: TranscodeStatus;
};

export enum TranscodeStage {
	Waiting,
	Scanning,
	Transcoding,
	Finished,
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

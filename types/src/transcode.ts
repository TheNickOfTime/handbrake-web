export enum TranscodeStage {
	Waiting,
	Scanning,
	Transcoding,
	Finished,
	Stopped,
}

export type TranscodeInfoType = {
	percentage: string;
	eta?: string;
	currentFPS?: number;
	averageFPS?: number;
};

export type TranscodeStageType = {
	stage: TranscodeStage;
	info: TranscodeInfoType;
};

export type TranscodeStatusUpdateType = {
	id: string;
	status: TranscodeStageType;
};

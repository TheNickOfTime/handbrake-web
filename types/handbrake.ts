export type HandbrakeJSONOutput = {
	State: string;
	Scanning?: Scanning;
	Working?: Working;
	WorkDone?: WorkDone;
};

export type Scanning = {
	Preview: number;
	PreviewCount: number;
	Progress: number;
	SequenceID: number;
	Title: number;
	TitleCount: number;
};

export type Working = {
	ETASeconds: number;
	Hours: number;
	Minutes: number;
	Pass: number;
	PassCount: number;
	PassID: number;
	Paused: number;
	Progress: number;
	Rate: number;
	RateAvg: number;
	Seconds: number;
	SequenceID: number;
};

export type WorkDone = {
	Error: number;
	SequenceID: number;
};

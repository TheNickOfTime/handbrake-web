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

/*
	{
		Scanning: {
			Preview: 10,
			PreviewCount: 10,
			Progress: 1,
			SequenceID: 0,
			Title: 1,
			TitleCount: 1
		},
		State: 'SCANNING'
	}
	{
		State: 'WORKING',
		Working: {
			ETASeconds: 0,
			Hours: -1,
			Minutes: -1,
			Pass: 1,
			PassCount: 1,
			PassID: 0,
			Paused: 0,
			Progress: 0.991304337978363,
			Rate: 4.138995635116771e-8,
			RateAvg: 0,
			Seconds: -1,
			SequenceID: 1
		}
	}
	{ State: 'WORKDONE', WorkDone: { Error: 0, SequenceID: 1 } }
	*/

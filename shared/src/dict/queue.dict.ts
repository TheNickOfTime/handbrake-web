import { TranscodeStage } from '../types/transcode';

export const statusSorting: { [key in TranscodeStage]: number } = {
	[TranscodeStage.Transcoding]: 1,
	[TranscodeStage.Scanning]: 2,
	[TranscodeStage.Waiting]: 3,
	[TranscodeStage.Stopped]: 4,
	[TranscodeStage.Error]: 5,
	[TranscodeStage.Finished]: 6,
};

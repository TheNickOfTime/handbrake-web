import { spawn, ChildProcessWithoutNullStreams as ChildProcess } from 'child_process';
import { Socket } from 'socket.io-client';
import { Job, QueueEntry } from '../../types/queue';
import fs from 'fs';
import path from 'path';
import { TranscodeStage, TranscodeStatus, TranscodeStatusUpdate } from '../../types/transcode';
import { HandbrakeJSONOutput, Muxing, Scanning, WorkDone, Working } from '../../types/handbrake';

let handbrake: ChildProcess | null = null;
export const isTranscoding = () => handbrake != null;

let job: QueueEntry | null = null;
export const getJobID = () => job?.id;
export const getJobData = () => job?.job;

const writePresetToFile = (preset: object) => {
	const presetString = JSON.stringify(preset);
	const presetDir = './temp';
	const presetName = 'preset.json';

	if (!fs.existsSync(presetDir)) {
		fs.mkdirSync(presetDir);
	}

	fs.writeFile(path.join(presetDir, presetName), presetString, (err) => {
		if (err) {
			console.error('[worker] Preset failed to write to file.');
			console.error(err);
		} else {
			console.log('[worker] Sucessfully wrote preset to file.');
		}
	});
};

export function StartTranscode(queueEntry: QueueEntry, socket: Socket) {
	job = queueEntry;
	writePresetToFile(queueEntry.job.preset);

	const presetName = queueEntry.job.preset.PresetList[0].PresetName;

	handbrake = spawn('HandBrakeCLI', [
		'--preset-import-file',
		'./temp/preset.json',
		'--preset',
		presetName,
		'-i',
		queueEntry.job.input,
		'-o',
		queueEntry.job.output,
		'--json',
	]);

	const transcodeStatus: TranscodeStatus = {
		stage: TranscodeStage.Waiting,
		info: {
			percentage: '0.00 %',
		},
	};

	handbrake.stdout.on('data', (data) => {
		const outputString: string = data.toString();
		const jsonRegex = /((^[A-Z][a-z]+):\s({(?:[\n\s+].+\n)+^}))+/gm;
		const jsonOutputMatches = outputString.matchAll(jsonRegex);

		for (const match of jsonOutputMatches) {
			const outputKind = match[2];
			const outputJSON: HandbrakeJSONOutput = JSON.parse(match[3]);

			switch (outputKind) {
				case 'Version':
					console.log('Version: ', outputJSON);
					break;
				case 'Progress':
					switch (outputJSON['State']) {
						case 'SCANNING':
							const scanning: Scanning = outputJSON.Scanning!;
							transcodeStatus.stage = TranscodeStage.Scanning;
							transcodeStatus.info = {
								percentage: `${scanning.Progress.toFixed(2)} %`,
							};
							const scanningUpdate: TranscodeStatusUpdate = {
								id: queueEntry.id,
								status: transcodeStatus,
							};
							socket.emit('transcoding', scanningUpdate);
							console.log(`Scanning: ${(scanning.Progress * 100).toFixed(2)} %`);
							break;
						case 'WORKING':
							const working: Working = outputJSON.Working!;
							transcodeStatus.stage = TranscodeStage.Transcoding;
							transcodeStatus.info = {
								percentage: `${(working.Progress * 100).toFixed(2)} %`,
								eta: `${working.ETASeconds}`,
							};
							const workingUpdate: TranscodeStatusUpdate = {
								id: queueEntry.id,
								status: transcodeStatus,
							};
							socket.emit('transcoding', workingUpdate);
							console.log(`Transcoding: ${(working.Progress * 100).toFixed(2)} %`);
							break;
						case 'MUXING':
							const muxing: Muxing = outputJSON.Muxing!;

							console.log(`Muxing: ${(muxing.Progress * 100).toFixed(2)} %`);
							break;
						case 'WORKDONE':
							const workDone: WorkDone = outputJSON.WorkDone!;

							if (workDone.Error == 0) {
								transcodeStatus.stage = TranscodeStage.Finished;
								transcodeStatus.info = {
									percentage: `100.00 %`,
								};
								const finishedUpdate: TranscodeStatusUpdate = {
									id: queueEntry.id,
									status: transcodeStatus,
								};

								// isTranscoding = false;
								job = null;

								socket.emit('transcoding', finishedUpdate);
								console.log(`Finished: 100.00%`);
							} else {
								console.log(`Finished: With error ${workDone.Error}`);
							}
							break;
						default:
							console.error('[error] unexpected json output:', outputJSON);
							break;
					}
			}
		}
	});

	handbrake.stderr.on('data', (data) => {
		const output: string = data.toString();

		console.error('[error] ', output);
	});
}

export function StopTranscode(socket: Socket) {
	if (handbrake) {
		if (job) {
			if (socket.connected) {
				const newStatus: TranscodeStatus = {
					stage: TranscodeStage.Stopped,
					info: {
						percentage: `${(0).toFixed(2)} %`,
					},
				};
				const statusUpdate: TranscodeStatusUpdate = {
					id: job.id,
					status: newStatus,
				};
				socket.emit('transcode-stopped', statusUpdate);
				console.log(`[worker] Informing the server that job '${job.id}' has been stopped.`);
			} else {
				console.error(
					"[worker] [error] Cannot send the event 'transcode-stopped' because the server socket is not connected."
				);
			}
		} else {
			console.error(
				"[worker] [error] Cannot send the event 'transcode-stopped' because the current job is null."
			);
		}
		handbrake.kill();
	} else {
		console.log(
			`[worker] The worker is not transcoding anything, there is no transcode to stop.`
		);
	}
}

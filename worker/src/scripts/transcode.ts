import { spawn, ChildProcessWithoutNullStreams as ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Socket } from 'socket.io-client';
import { QueueEntryType } from 'types/queue';
import { TranscodeStage, TranscodeStatusType, TranscodeStatusUpdateType } from 'types/transcode';
import { HandbrakeOutputType, Muxing, Scanning, WorkDone, Working } from 'types/handbrake';

let handbrake: ChildProcess | null = null;
export const isTranscoding = () => handbrake != null;

let job: QueueEntryType | null = null;
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

export function StartTranscode(queueEntry: QueueEntryType, socket: Socket) {
	job = queueEntry;
	writePresetToFile(queueEntry.job.preset);

	const presetName = queueEntry.job.preset.PresetList[0].PresetName;
	const outputParsed = path.parse(queueEntry.job.output);
	const tempOutputName = path.join(
		outputParsed.dir,
		outputParsed.name + '.transcoding' + outputParsed.ext
	);
	const fileCollision = fs.existsSync(queueEntry.job.output);

	handbrake = spawn('HandBrakeCLI', [
		'--preset-import-file',
		'./temp/preset.json',
		'--preset',
		presetName,
		'-i',
		queueEntry.job.input,
		'-o',
		tempOutputName,
		'--json',
	]);

	const transcodeStatus: TranscodeStatusType = {
		stage: TranscodeStage.Scanning,
		info: {
			percentage: '0.00 %',
		},
	};
	const statusUpdate: TranscodeStatusUpdateType = {
		id: job.id,
		status: transcodeStatus,
	};

	socket.emit('transcoding', statusUpdate);

	handbrake.stdout.on('data', (data) => {
		const outputString: string = data.toString();
		const jsonRegex = /((^[A-Z][a-z]+):\s({(?:[\n\s+].+\n)+^}))+/gm;
		const jsonOutputMatches = outputString.matchAll(jsonRegex);

		for (const match of jsonOutputMatches) {
			const outputKind = match[2];
			const outputJSON: HandbrakeOutputType = JSON.parse(match[3]);

			switch (outputKind) {
				case 'Version':
					console.log(`[worker] [transcode] [version]`, outputJSON);
					break;
				case 'Progress':
					switch (outputJSON['State']) {
						case 'SCANNING':
							const scanning: Scanning = outputJSON.Scanning!;
							transcodeStatus.stage = TranscodeStage.Scanning;
							transcodeStatus.info = {
								percentage: `${scanning.Progress.toFixed(2)} %`,
							};
							const scanningUpdate: TranscodeStatusUpdateType = {
								id: queueEntry.id,
								status: transcodeStatus,
							};
							socket.emit('transcoding', scanningUpdate);
							console.log(
								`[worker] [transcode] [scanning] ${(
									scanning.Progress * 100
								).toFixed(2)} %`
							);
							break;
						case 'WORKING':
							const working: Working = outputJSON.Working!;
							transcodeStatus.stage = TranscodeStage.Transcoding;
							transcodeStatus.info = {
								percentage: `${(working.Progress * 100).toFixed(2)} %`,
								eta: `${working.Hours > 0 ? working.Hours + 'h' : ''}${
									working.Minutes > 0 ? working.Minutes + 'm' : ''
								}${working.Seconds >= 0 ? working.Seconds + 's' : ''}`,
								currentFPS: working.Rate,
								averageFPS: working.RateAvg,
							};
							const workingUpdate: TranscodeStatusUpdateType = {
								id: queueEntry.id,
								status: transcodeStatus,
							};
							socket.emit('transcoding', workingUpdate);
							console.log(
								`[worker] [transcode] [processing] ${(
									working.Progress * 100
								).toFixed(2)} %`
							);
							// console.log(working);
							break;
						case 'MUXING':
							const muxing: Muxing = outputJSON.Muxing!;

							console.log(
								`[worker] [transcode] [muxing] ${(muxing.Progress * 100).toFixed(
									2
								)} %`
							);
							break;
						case 'WORKDONE':
							const workDone: WorkDone = outputJSON.WorkDone!;

							if (workDone.Error == 0) {
								transcodeStatus.stage = TranscodeStage.Finished;
								transcodeStatus.info = {
									percentage: `100.00 %`,
								};
								const finishedUpdate: TranscodeStatusUpdateType = {
									id: queueEntry.id,
									status: transcodeStatus,
								};

								// Remove original file if necessary, remove '.transoding' temp extension from the file
								if (fileCollision) {
									fs.rm(queueEntry.job.output, (err) => {
										if (err) {
											console.error(err);
										} else {
											console.log(
												`[worker] [transcode] Overwriting '${path.basename(
													queueEntry.job.output
												)}' with the contents of the current job'.`
											);
											fs.renameSync(tempOutputName, queueEntry.job.output);
										}
									});
								} else {
									fs.renameSync(tempOutputName, queueEntry.job.output);
								}

								job = null;

								socket.emit('transcoding', finishedUpdate);
								console.log(`[worker] [transcode] [finished] 100.00%`);
							} else {
								console.log(
									`[worker] [transcode] [error] Finished with error ${workDone.Error}`
								);
							}
							break;
						default:
							console.error(
								'[worker] [transcode] [error] Unexpected json output:',
								outputJSON
							);
							break;
					}
			}
		}
	});

	handbrake.stderr.on('data', (data) => {
		const output: string = data.toString();

		console.error('[worker] [error] ', output);
	});
}

export function StopTranscode(socket: Socket) {
	if (handbrake) {
		if (job) {
			if (socket.connected) {
				const newStatus: TranscodeStatusType = {
					stage: TranscodeStage.Stopped,
					info: {
						percentage: `${(0).toFixed(2)} %`,
					},
				};
				const statusUpdate: TranscodeStatusUpdateType = {
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

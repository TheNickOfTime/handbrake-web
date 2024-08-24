import { spawn, ChildProcessWithoutNullStreams as ChildProcess } from 'child_process';
import fs from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { Socket } from 'socket.io-client';
import { setTimeout } from 'timers/promises';
import { HandbrakeOutputType, Muxing, Scanning, WorkDone, Working } from 'types/handbrake';
import { HandbrakePresetType } from 'types/preset';
import { JobDataType, JobStatusType } from 'types/queue';
import { TranscodeStage } from 'types/transcode';
import logger, { createJobLogger, formatJSON } from 'logging';

let handbrake: ChildProcess | null = null;
export const isTranscoding = () => handbrake != null;

let currentJob: JobDataType | null = null;
export let currentJobID: number | null = null;
let presetPath: string | undefined;

const writePresetToFile = async (preset: HandbrakePresetType) => {
	try {
		const presetString = JSON.stringify(preset);
		const presetDir = '/tmp';
		const presetName = 'preset.json';

		if (!fs.existsSync(presetDir)) {
			mkdir(presetDir);
		}

		presetPath = path.join(presetDir, presetName);

		await writeFile(presetPath, presetString);
		logger.info('[worker] Sucessfully wrote preset to file.');
	} catch (err) {
		logger.error(`[worker] [error] Could not write preset to file at ${presetPath}.`);
		console.error(err);
	}
};

const getTempOutputName = (output: string) => {
	const outputParsed = path.parse(output);
	return path.join(outputParsed.dir, outputParsed.name + '.transcoding' + outputParsed.ext);
};

export async function StartTranscode(jobID: number, socket: Socket) {
	try {
		// Get job data from db
		const jobData: JobDataType = await socket.timeout(5000).emitWithAck('get-job-data', jobID);
		currentJob = jobData;
		currentJobID = jobID;

		// Get preset data
		const presetData: HandbrakePresetType = await socket
			.timeout(5000)
			.emitWithAck('get-preset-data', jobData.preset_category, jobData.preset_id);
		await writePresetToFile(presetData);

		const tempOutputName = getTempOutputName(jobData.output_path);
		const fileCollision = fs.existsSync(jobData.output_path);

		// Add file transport to the logger
		// const fileTransport = newJobTransport(jobID);
		// logger.add(fileTransport);
		const jobLogger = createJobLogger(jobID);

		handbrake = spawn('HandBrakeCLI', [
			'--preset-import-file',
			presetPath!,
			'--preset',
			jobData.preset_id,
			'-i',
			jobData.input_path,
			'-o',
			tempOutputName,
			'--json',
		]);

		const newStatus: JobStatusType = {
			transcode_stage: TranscodeStage.Scanning,
			time_started: Date.now(),
		};

		socket.emit('transcode-update', jobID, newStatus);

		handbrake.stdout.on('data', (data) => {
			const outputString: string = data.toString();
			const jsonRegex = /((^[A-Z][a-z]+):\s({(?:[\n\s+].+\n)+^}))+/gm;
			const jsonOutputMatches = outputString.matchAll(jsonRegex);

			for (const match of jsonOutputMatches) {
				const outputKind = match[2];
				const outputJSON: HandbrakeOutputType = JSON.parse(match[3]);

				switch (outputKind) {
					case 'Version':
						jobLogger.info(
							`[transcode] [version] ${formatJSON(
								JSON.stringify(outputJSON, null, 2)
							)}`
						);
						break;
					case 'Progress':
						switch (outputJSON['State']) {
							case 'SCANNING':
								const scanning: Scanning = outputJSON.Scanning!;
								const scanningStatus: JobStatusType = {
									transcode_stage: TranscodeStage.Scanning,
									transcode_percentage: scanning.Progress,
								};
								socket.emit('transcode-update', jobID, scanningStatus);
								jobLogger.info(
									`[transcode] [scanning] ${(scanning.Progress * 100).toFixed(
										2
									)} %`
								);
								break;
							case 'WORKING':
								const working: Working = outputJSON.Working!;
								const workingStatus: JobStatusType = {
									transcode_stage: TranscodeStage.Transcoding,
									transcode_percentage: working.Progress,
									transcode_eta: working.ETASeconds,
									transcode_fps_current: working.Rate,
									transcode_fps_average: working.RateAvg,
								};
								socket.emit('transcode-update', jobID, workingStatus);
								jobLogger.info(
									`[transcode] [processing] ${(working.Progress * 100).toFixed(
										2
									)} %`
								);
								break;
							case 'MUXING':
								const muxing: Muxing = outputJSON.Muxing!;
								const muxingStatus: JobStatusType = {
									transcode_stage: TranscodeStage.Transcoding,
									transcode_percentage: muxing.Progress,
								};
								socket.emit('transcode-update', jobID, muxingStatus);
								jobLogger.info(
									`[transcode] [muxing] ${(muxing.Progress * 100).toFixed(2)} %`
								);
								break;
							case 'WORKDONE':
								const workDone: WorkDone = outputJSON.WorkDone!;

								if (workDone.Error == 0) {
									const doneStatus: JobStatusType = {
										worker_id: null,
										transcode_stage: TranscodeStage.Finished,
										transcode_percentage: 1,
										transcode_eta: 0,
										transcode_fps_current: 0,
										time_finished: Date.now(),
									};

									// Remove original file if necessary, remove '.transoding' temp extension from the file
									if (fileCollision) {
										fs.rm(jobData.output_path, (err) => {
											if (err) {
												jobLogger.error(err);
											} else {
												jobLogger.info(
													`[transcode] Overwriting '${path.basename(
														jobData.output_path
													)}' with the contents of the current job'.`
												);
												fs.renameSync(tempOutputName, jobData.output_path);
											}
										});
									} else {
										fs.renameSync(tempOutputName, jobData.output_path);
									}

									TranscodeFileCleanup();
									socket.emit('transcode-finished', jobID, doneStatus);
									jobLogger.info(`[transcode] [finished] 100.00%`);
								} else {
									jobLogger.error(
										`[transcode] [error] Finished with error ${workDone.Error}`
									);
									socket.emit('transcode-error', jobID);
								}
								break;
							default:
								jobLogger.error(
									`[transcode] [error] Unexpected json output:\n${outputJSON}`
								);
								break;
						}
				}
			}
		});

		handbrake.stderr.on('data', (data) => {
			const output: string = data.toString();

			jobLogger.error(`[transcode] \n${output}`);
		});

		handbrake.on('exit', () => {});
	} catch (err) {
		console.error(err);
	}
}

export function StopTranscode(id: number, socket: Socket) {
	if (handbrake) {
		if (currentJob && currentJobID == id) {
			if (socket.connected) {
				const newStatus: JobStatusType = {
					transcode_stage: TranscodeStage.Stopped,
					transcode_percentage: 0,
				};
				TranscodeFileCleanup();
				logger.info(`[transcode] Informing the server that job '${id}' has been stopped.`);
				socket.emit('transcode-stopped', currentJobID, newStatus);
			} else {
				logger.error(
					"[transcode] Cannot send the event 'transcode-stopped' because the server socket is not connected."
				);
			}
		} else {
			logger.error(
				"[transcode] Cannot send the event 'transcode-stopped' because the current job is null."
			);
		}
		handbrake.kill();
	} else {
		logger.info(
			`[transcode] The worker is not transcoding anything, there is no transcode to stop.`
		);
	}
}

async function TranscodeFileCleanup() {
	// Wait one second to avoid race conditions with other file operations
	await setTimeout(1000);

	//Temp transcoding file
	if (currentJob) {
		const tempOutputName = getTempOutputName(currentJob.output_path);
		const tempFileExists = fs.existsSync(tempOutputName);
		if (tempFileExists) {
			fs.rm(tempOutputName, (err) => {
				if (err) {
					logger.error(err);
				} else {
					logger.info(`[transcode] Cleaned up temp file '${tempOutputName}'.`);
				}
			});
		}
	}

	//Temp preset file
	if (presetPath) {
		const presetExists = fs.existsSync(presetPath);
		if (presetExists) {
			fs.rm(presetPath, (err) => {
				if (err) {
					logger.info(err);
				}
			});
		}
	}

	// Reset variables
	currentJob = null;
	currentJobID = null;
	presetPath = undefined;
}

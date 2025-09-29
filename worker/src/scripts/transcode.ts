import {
	type HandbrakeOutputType,
	type Muxing,
	type Scanning,
	type WorkDone,
	type Working,
} from '@handbrake-web/shared/types/handbrake';
import { type HandbrakePresetType } from '@handbrake-web/shared/types/preset';
import { type JobDataType, type JobStatusType } from '@handbrake-web/shared/types/queue';
import { TranscodeStage } from '@handbrake-web/shared/types/transcode';
import { type ChildProcessWithoutNullStreams as ChildProcess, spawn } from 'child_process';
import { access, mkdir, rename, rm, writeFile } from 'fs/promises';
import logger, {
	createJobLogger,
	type CustomTransportType,
	formatJSON,
	SendLogToServer,
} from 'logging';
import path from 'path';
import { Socket } from 'socket.io-client';

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

		// Make the preset directory if it doesn't exist
		try {
			await access(presetDir);
		} catch {
			await mkdir(presetDir);
		}

		presetPath = path.join(presetDir, presetName);

		await writeFile(presetPath, presetString);
		logger.info('[worker] Sucessfully wrote preset to file.');
	} catch (err) {
		logger.error(`[worker] [error] Could not write preset to file at ${presetPath}.`);
		throw err;
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
		const fileCollision = await (async () => {
			try {
				await access(jobData.output_path);
				return true;
			} catch {
				return false;
			}
		})();

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

		handbrake.stdout.on('data', async (data) => {
			const outputString: string = data.toString();
			const jsonRegex = /((^[A-Z][a-z]+):\s({(?:[\n\s+].+\n)+^}))+/gm;
			const jsonOutputMatches = outputString.matchAll(jsonRegex);

			for await (const match of jsonOutputMatches) {
				const outputKind = match[2];
				const outputJSON: HandbrakeOutputType = JSON.parse(match[3]!);

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

									// Remove original file if necessary
									if (fileCollision) {
										jobLogger.info(
											`[transcode] Overwriting '${path.basename(
												jobData.output_path
											)}' with the contents of the current job'.`
										);

										try {
											await rm(jobData.output_path);
											jobLogger.info(
												`[transcode] Removing the file '${path.basename(
													jobData.output_path
												)}'.`
											);
										} catch (err) {
											jobLogger.error(
												`[transcode] Could not remove the file '${path.basename(
													jobData.output_path
												)}' for overwriting.`
											);
											throw err;
										}
									}

									// Remove '.transoding' temp extension from the file
									try {
										await rename(tempOutputName, jobData.output_path);
										jobLogger.info(
											`[transcode] Renaming the file '${path.basename(
												tempOutputName
											)}' to '${path.basename(jobData.output_path)}'.`
										);
									} catch (err) {
										jobLogger.error(
											`[transcode] Could not rename the file '${path.basename(
												tempOutputName
											)}' to '${path.basename(jobData.output_path)}'.`
										);
										throw err;
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

		handbrake.on('exit', () => {
			// Send log from job to the server
			const transport = (jobLogger.transports as CustomTransportType[]).find(
				(transport) => transport._dest != undefined
			);
			if (transport && transport.dirname && transport.filename) {
				const logPath = path.join(transport.dirname, transport.filename);
				SendLogToServer(logPath, socket);
			}

			jobLogger.destroy();
		});
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
	// await setTimeout(1000);

	//Temp transcoding file
	if (currentJob) {
		const tempOutputName = getTempOutputName(currentJob.output_path);
		const tempFileExists = await (async () => {
			try {
				await access(tempOutputName);
				return true;
			} catch {
				return false;
			}
		})();
		if (tempFileExists) {
			try {
				await rm(tempOutputName);
				logger.info(`[transcode] Cleaned up temp file '${path.basename(tempOutputName)}'.`);
			} catch (err) {
				logger.error(
					`[transcode] Could not clean up temp file '${path.basename(tempOutputName)}'.`
				);
				throw err;
			}
		}
	}

	//Temp preset file
	if (presetPath) {
		const presetExists = await (async () => {
			try {
				await access(presetPath);
				return true;
			} catch {
				return false;
			}
		})();
		if (presetExists) {
			try {
				await rm(presetPath);
				logger.info(`[transcode] Removed the preset file '${path.basename(presetPath)}'.`);
			} catch (err) {
				logger.error(
					`[error] Could not remove the preset file '${path.basename(presetPath)}'.`
				);
				throw err;
			}
		}
	}

	// Reset variables
	currentJob = null;
	currentJobID = null;
	presetPath = undefined;
}

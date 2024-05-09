import { spawn } from 'child_process';
import { Socket } from 'socket.io-client';
import { Job, QueueEntry } from '../../types/queue';
import { TranscodeStage, TranscodeStatus, TranscodeStatusUpdate } from '../../types/transcode';
import fs from 'fs';

const writePresetToFile = (preset: object) => {
	const presetString = JSON.stringify(preset);
	const presetFile = fs.writeFile('presets/preset.json', presetString, (err) => {
		if (err) {
			console.error('[worker] Preset failed to write to file.');
		} else {
			console.log('[worker] Sucessfully wrote preset to file.');
		}
	});
};

export default function Transcode(queueEntry: QueueEntry, socket: Socket) {
	console.log(queueEntry);

	writePresetToFile(queueEntry.job.preset);

	// return;

	const presetName = queueEntry.job.preset.PresetList[0].PresetName;
	console.log(presetName);

	const handbrake = spawn('handbrake', [
		'--preset-import-file',
		'./presets/preset.json',
		'--preset',
		presetName,
		'-i',
		queueEntry.job.input,
		'-o',
		queueEntry.job.output,
		// '--json',
	]);

	const transcodeStatus: TranscodeStatus = {
		stage: TranscodeStage.Waiting,
		info: {
			percentage: '0.00 %',
		},
	};

	handbrake.stdout.on('data', (data) => {
		const output: string = data.toString();

		const encodingRegex =
			/Encoding: task \d+ of \d+, (\d+\.\d+ %)(?: \((\d+\.\d+ fps), avg (\d+\.\d+ fps), ETA (\d\dh\d\dm\d\ds)\))?/;
		const encodingMatch = output.match(encodingRegex);
		if (encodingMatch) {
			transcodeStatus.stage = TranscodeStage.Transcoding;
			transcodeStatus.info = {
				percentage: encodingMatch[1],
				currentFPS: encodingMatch[2],
				averageFPS: encodingMatch[3],
				eta: encodingMatch[4],
			};

			// console.log(`[encoding] ${transcodeStatus.info.percentage}`);

			const update: TranscodeStatusUpdate = {
				id: queueEntry.id,
				status: transcodeStatus,
			};

			socket.emit('transcoding', update);
		}

		console.log(output);
	});

	handbrake.stderr.on('data', (data) => {
		const output: string = data.toString();

		const scanningRegex = /Scanning title \d of \d, preview \d, (\d\d\.\d\d \%)/;
		const scanningMatch = output.match(scanningRegex);

		if (scanningMatch) {
			transcodeStatus.stage = TranscodeStage.Scanning;
			transcodeStatus.info = { percentage: scanningMatch[1] };
			const update: TranscodeStatusUpdate = {
				id: queueEntry.id,
				status: transcodeStatus,
			};
			socket.emit('transcoding', update);
			// console.log(`[scanning] ${transcodeStatus.info.percentage}`);
		}

		console.error('[error] ', output);
	});

	handbrake.on('close', () => {
		const update: TranscodeStatusUpdate = {
			id: queueEntry.id,
			status: {
				stage: TranscodeStage.Finished,
				info: { percentage: '100.00%' },
			},
		};
		socket.emit('transcoding', update);
		socket.emit('transcode-finished');
	});
}

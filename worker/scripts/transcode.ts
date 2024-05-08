import { spawn } from 'child_process';
import { Socket } from 'socket.io-client';
import { Job } from '../../types/queue';
import { TranscodeStage, TranscodeStatus } from '../../types/transcode';
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

const importPresetFileToHandbrake = () => {
	console.log('[worker] Importing preset file to HandBrake.');
	const handbrake = spawn('handbrake', [
		'--preset-import-file',
		'/workspaces/handbrake-web/presets/preset.json',
	]);

	handbrake.stdout.on('data', (data) => {
		console.log('[worker] ', data.toString());
	});

	handbrake.stderr.on('data', (data) => {
		console.error('[error] ', data.toString());
	});
};

// const getPresetName = (preset: object) => {
// 	preset['PresetName'];
// };

export default function Transcode(data: Job, socket: Socket) {
	writePresetToFile(data.preset);

	const presetName = data.preset.PresetList[0].PresetName;
	console.log(presetName);

	const handbrake = spawn('handbrake', [
		'--preset-import-file',
		'./presets/preset.json',
		'--preset',
		presetName,
		'-i',
		data.input,
		'-o',
		data.output,
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

			socket.emit('transcoding', transcodeStatus);
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
			socket.emit('transcoding', transcodeStatus);
			// console.log(`[scanning] ${transcodeStatus.info.percentage}`);
		}

		console.error('[error] ', output);
	});

	handbrake.on('close', () => {
		const data: TranscodeStatus = {
			stage: TranscodeStage.Finished,
			info: { percentage: '100.00%' },
		};
		socket.emit('transcoding', data);
		socket.emit('transcode-finished');
	});
}

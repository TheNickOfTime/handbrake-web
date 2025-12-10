import { GetApplicationVersion } from '@handbrake-web/shared/scripts/version';
import type {
	WorkerCapabilities,
	WorkerProperties,
	WorkerVersion,
} from '@handbrake-web/shared/types/worker';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import logger from './logging';

const execFilePromise = promisify(execFile);

let info: WorkerProperties | null = null;

export async function GetWorkerProperties(): Promise<WorkerProperties> {
	if (info == null) {
		try {
			const handbrake = await execFilePromise('HandBrakeCLI', ['--version']);

			const version = GetWorkerVersions(handbrake);
			logger.info(`[properties] HandBrake Web Application Version = ${version.application}`);
			logger.info(`[properties] HandBrake Version = ${version.handbrake}`);

			const capabilities = GetWorkerCapabilities(handbrake);
			Object.entries(capabilities).map(([name, capability]) => {
				logger.info(`[properties] Capability '${name}' support = ${capability}`);
			});

			return {
				version,
				capabilities,
			};
		} catch (err) {
			logger.error(`[capabilities] [error] Could not get the worker's info.`);
			throw err;
		}
	} else {
		return info;
	}
}

function GetWorkerVersions(handbrake: { stdout: string; stderr: string }): WorkerVersion {
	try {
		const handbrakeVersionRegex = /(?<=HandBrake\s)\d+\.\d+\.\d+/;
		const handbrakeVersionMatch = handbrake.stdout.match(handbrakeVersionRegex);
		if (handbrakeVersionMatch == null)
			throw new Error(
				`No version match in 'stdout' for regex '${handbrakeVersionRegex.toString()}'.`
			);

		const handbrakeVersion = handbrakeVersionMatch[0];
		const handbrakeWebVersion = GetApplicationVersion();

		return {
			handbrake: handbrakeVersion,
			application: handbrakeWebVersion,
		};
	} catch (err) {
		logger.error(`[capabilities] [error] Could not check the worker's version.`);
		throw err;
	}
}

function GetWorkerCapabilities(handbrake: { stdout: string; stderr: string }): WorkerCapabilities {
	try {
		const capabilities: WorkerCapabilities = {
			cpu: true, // always true (for now)
			qsv: false,
			nvenc: false,
			vcn: false, // always false (for now)
		};

		if (process.arch.match(/arm/)) {
			logger.info(
				`[capabilities] The proccess architecture is ARM/ARM64. Skipping hardware capabilities check.`
			);
			return capabilities;
		}

		const qsvRegex = /qsv:\s(\w+)\savailable\son\sthis\ssystem/;
		const qsvMatch = handbrake.stderr.match(qsvRegex);
		if (qsvMatch == null)
			throw new Error(
				`No version match in:\n${handbrake.stderr}\n for regex '${qsvRegex.toString()}'.`
			);
		const qsvResult = qsvMatch[1]! == 'is';
		capabilities.qsv = qsvResult;

		const nvencRegex = /nvenc:\sversion\s\d+\.\d+\s(\w+)\savailable/;
		const nvencNegativeRegex = /Cannot\sload\slibnvidia-encode\.so\.1/;
		const nvencMatch = handbrake.stderr.match(nvencRegex);
		const nvencNegativeMatch = handbrake.stderr.match(nvencNegativeRegex);
		if (nvencMatch == null && nvencNegativeMatch == null)
			throw new Error(
				`No version match in:\n${
					handbrake.stderr
				}\n for regex '${nvencRegex.toString()}' or '${nvencNegativeRegex.toString()}'.`
			);
		const nvencResult = nvencMatch != null;
		capabilities.nvenc = nvencResult;

		return capabilities;
	} catch (err) {
		logger.error(`[capabilities] [error] Could not check the worker's capabilities.`);
		throw err;
	}
}

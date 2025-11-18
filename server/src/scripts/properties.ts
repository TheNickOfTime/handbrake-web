import type { WorkerProperties } from '@handbrake-web/shared/types/worker';

const workerProperties: { [index: string]: WorkerProperties } = {};

export function GetWorkerProperties() {
	return workerProperties;
}

export function AddWorkerProperties(workerID: string, properties: WorkerProperties) {
	workerProperties[workerID] = properties;
}

export function RemoveWorkerProperties(workerID: string) {
	delete workerProperties[workerID];
}

import type { WorkerProperties } from '@handbrake-web/shared/types/worker';
import { EmitToAllClients } from './connections';

const workerProperties: Record<string, WorkerProperties> = {};

export function GetWorkerProperties() {
	return workerProperties;
}

export function AddWorkerProperties(workerID: string, properties: WorkerProperties) {
	workerProperties[workerID] = properties;
	UpdateWorkerProperties();
}

export function RemoveWorkerProperties(workerID: string) {
	delete workerProperties[workerID];
	UpdateWorkerProperties();
}

export function UpdateWorkerProperties() {
	EmitToAllClients('properties-update', workerProperties);
}

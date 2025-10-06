import { CheckDirectoryPermissions } from '@handbrake-web/shared/scripts/permissions';
import { getDataPath, getVideoPath, InitializeDataPath } from 'scripts/data';
import logger from 'scripts/logging';

async function Worker() {
	// Check critical permissions
	await InitializeDataPath();
	await CheckDirectoryPermissions([getDataPath(), getVideoPath()], logger);

	// Startup only occurs if the previous functions ever finish
	const startup = await import('./worker-startup');
	startup.default();
}

Worker();

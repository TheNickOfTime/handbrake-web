import { CheckDirectoryPermissions } from '@handbrake-web/shared/scripts/permissions';
import logger from 'logging';
import { getDataPath, getVideoPath } from 'scripts/data';

async function Server() {
	// Check critical permissions
	await CheckDirectoryPermissions([getDataPath(), getVideoPath()], logger);

	// Startup only occurs if the previous functions ever finish
	const startup = await import('./server-startup');
	startup.default();
}

Server();

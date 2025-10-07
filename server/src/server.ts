import { CreateConsoleLogger } from '@handbrake-web/shared/logger';
import { CheckDirectoryPermissions } from '@handbrake-web/shared/scripts/permissions';
import { getDataPath, getVideoPath } from 'scripts/data';

async function Server() {
	// Check critical permissions
	const permissionsLogger = CreateConsoleLogger('server');
	await CheckDirectoryPermissions([getDataPath(), getVideoPath()], permissionsLogger);

	// Startup only occurs if the previous functions ever finish
	const startup = await import('./server-startup');
	startup.default();
}

Server();

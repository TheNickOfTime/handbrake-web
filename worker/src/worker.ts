import { CreateConsoleLogger } from '@handbrake-web/shared/logger';
import { CheckDirectoryPermissions } from '@handbrake-web/shared/scripts/permissions';
import { getDataPath, getVideoPath, InitializeDataPath } from 'scripts/data';

async function Worker() {
	// Check critical permissions
	const permissionsLogger = CreateConsoleLogger('worker');
	await InitializeDataPath(permissionsLogger);
	await CheckDirectoryPermissions([getDataPath(), getVideoPath()], permissionsLogger);

	// Startup only occurs if the previous functions ever finish
	const startup = await import('./worker-startup');
	startup.default();
}

Worker();

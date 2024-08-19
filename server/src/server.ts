import { CheckDataDirectoryPermissions } from 'scripts/data';

async function Server() {
	// Check critical permissions
	await CheckDataDirectoryPermissions();

	// Startup only occurs if the previous functions ever finish
	const startup = await import('./server-startup');
	startup.default();
}

Server();

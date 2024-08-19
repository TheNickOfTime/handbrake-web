import { access, constants } from 'fs/promises';
import path from 'path';

export const dataPath = process.env.DATA_PATH || path.join(__dirname, '../../data');

export async function CheckDataDirectoryPermissions() {
	try {
		let error = false;

		// Check read permissions
		try {
			await access(dataPath, constants.R_OK);
		} catch (err) {
			console.error(
				`\x1b[2m${new Date(Date.now()).toLocaleTimeString('en-US', {
					hour12: false,
				})}\x1B[22m \x1b[31m[data] [error]\x1B[39m The application does not have read permissions for the directory '${dataPath}':`
			);
			console.error(err);
			error = true;
		}

		try {
			await access(dataPath, constants.W_OK);
		} catch (err) {
			console.error(
				`\x1b[2m${new Date(Date.now()).toLocaleTimeString('en-US', {
					hour12: false,
				})}\x1B[22m \x1b[31m[data] [error]\x1B[39m The application does not have write permissions for the directory '${dataPath}':`
			);
			console.error(err);
			error = true;
		}

		if (error) {
			throw new Error();
		}
	} catch (error) {
		// shut down application
		console.error(
			`\x1b[2m${new Date(Date.now()).toLocaleTimeString('en-US', {
				hour12: false,
			})}\x1B[22m \x1b[31m[data] [error]\x1B[39m The application does not have adequate permissions for '${dataPath}'.`
		);
		console.error(
			`\x1b[2m${new Date(Date.now()).toLocaleTimeString('en-US', {
				hour12: false,
			})}\x1B[22m \x1b[31m[data] [error]\x1B[39m Did you create the directories you mapped in the docker compose file prior to the creation of the container?\n\tIf not, docker creates these directories for you with root permissions.\n\tPlease run 'chown' or otherwise modify permissions to have read & write access for the user you are running this container as.`
		);
		console.error(
			`\x1b[2m${new Date(Date.now()).toLocaleTimeString('en-US', {
				hour12: false,
			})}\x1B[22m \x1b[31m[data] [error]\x1B[39m The application cannot run without proper permissions for the data folder. The application will now shutdown.`
		);

		process.exit(0);
	}
}

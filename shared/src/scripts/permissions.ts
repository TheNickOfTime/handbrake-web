import { access, constants, readdir } from 'fs/promises';
import { join } from 'path';
import type { Logger } from 'winston';

export async function CheckDirectoryPermissions(paths: string[], logger: Logger) {
	logger.info(`[permissions] Checking necessary directory permissions...`);

	const errors: Error[] = [];
	const warnings: Error[] = [];

	for await (const directory of paths) {
		logger.info(`[permissions] Checking permissions for the path '${directory}'.`);

		// Check read permissions
		try {
			await access(directory, constants.R_OK);
		} catch (err) {
			if (err instanceof Error) {
				errors.push(err);
				logger.error(
					`[permissions] [error] The directory mapped to '${directory}' does not have adequate read permissions. This will cause issues.`
				);
			}
		}

		// Check write permissions
		try {
			await access(directory, constants.W_OK);
		} catch (err) {
			if (err instanceof Error) {
				errors.push(err);
				logger.error(
					`[permissions] [error] The directory mapped to '${directory}' does not have adequate write permissions. This will cause issues.`
				);
			}
		}

		// Recursively check read/write permissions within the directory
		try {
			const recursivePaths = (await readdir(directory)).map((item) => join(directory, item));

			for await (const item of recursivePaths) {
				// Check read permissions
				try {
					await access(item, constants.R_OK);
				} catch (err) {
					if (err instanceof Error) {
						warnings.push(err);
						logger.warn(
							`[permissions] [warn] The item at '${item}' does not have adequate read permissions. This may cause issues.`
						);
					}
				}

				// Check write permissions
				try {
					await access(item, constants.W_OK);
				} catch (err) {
					if (err instanceof Error) {
						warnings.push(err);
						logger.warn(
							`[permissions] [warn] The item at '${item}' does not have adequate write permissions. This may cause issues.`
						);
					}
				}
			}
		} catch (err) {
			logger.error(`[permissions] [error] Cannot recurse the directory '${directory}'.`);
		}

		logger.info(`[permissions] Finished checking permissions for the path '${directory}'.`);
	}

	logger.info(
		`[permissions] Finished checking permissions across ${paths.length} paths with ${errors.length} errors and ${warnings.length} warnings.`
	);

	if (errors.length > 0) {
		logger.error(
			`[permissions] There are ${errors.length} critical permissions errors. You can either change the user the container is being run as to one with adequate permissions in your Docker Compose file at the line that reads 'user: <your user>:<your group>' OR modify the permissions of the directories to match the user already speficied in your compose file (with 'sudo chown <your user>:<your group> -R <your directory>' for example).`
		);
		throw new AggregateError(errors);
	}
}

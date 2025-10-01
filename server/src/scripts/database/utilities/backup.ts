import type { Database } from 'better-sqlite3';
import logger from 'logging';
import { access, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { dataPath } from 'scripts/data';

export async function DatabaseBackup(sqlite: Database, name: string) {
	const backupDir = join(dataPath, 'backup');
	const backupName = name + '.db';
	const backupPath = join(backupDir, backupName);

	try {
		try {
			await access(backupDir);
		} catch {
			await mkdir(backupDir);
		}

		await sqlite.backup(backupPath);

		logger.info(`[server] [database] [backup] Backed up the database to '${backupPath}'.`);
	} catch (error) {
		logger.error(
			`[server] [database] [backup] [error] Could not backup the database to '${backupPath}'.`
		);
		logger.error(error);
	}
}

import type { Database } from 'better-sqlite3';
import logger from 'logging';
import { dataPath } from 'scripts/data';
import { database, databasePath, databaseVersion } from '../database';
import DatabaseMigrations from '../migrations/database-migrations';
import { DatabaseBackup } from './backup';

export async function CheckDatabaseVersion(sqlite: Database, isInitialized: boolean) {
	if (isInitialized) {
		try {
			try {
				const currentVersion = (
					await database
						.selectFrom('database_version')
						.select('version')
						.executeTakeFirstOrThrow()
				).version;

				if (currentVersion < databaseVersion) {
					await DatabaseBackup(sqlite, `database-version-${currentVersion}-backup`);
					DatabaseMigrations(currentVersion);
				} else if (currentVersion > databaseVersion) {
					logger.error(
						`[server] [database] [error] The database's version (${currentVersion}) is greater than the application's target version (${databaseVersion}). The database cannot be downgraded and therefore cannot be loaded.`
					);
					logger.error(
						`[server] [database] [error] Please attempt recovery by copying a previous version of the database (${databaseVersion} or lower) from '${dataPath}/backups' to '${databasePath}'.`
					);
					process.exit();
				}
			} catch (err) {
				logger.error(
					'[server] [database] [error] Cannot get database_version from the database. Application will now shut down.'
				);
				throw err;
			}
		} catch {
			await DatabaseBackup(sqlite, `database-version-0-backup`);
			DatabaseMigrations(-1);
		}
	} else {
		try {
			await database
				.insertInto('database_version')
				.values({ version: databaseVersion })
				.execute();
			logger.info(
				`[server] [database] The database version has not been previously set - setting it to '${databaseVersion}'. `
			);
		} catch (err) {
			logger.error(`[server] [database] Could not set the database version.`);
			throw err;
		}
	}
}

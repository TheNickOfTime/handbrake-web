import type { Migration, MigrationProvider } from 'kysely';

export class CustomMigrationProvider implements MigrationProvider {
	async getMigrations(): Promise<Record<string, Migration>> {
		const migrations: Record<string, Migration> = {
			'migration-1': await import('../migrations/migration-1'),
			'migration-2': await import('../migrations/migration-2'),
			'migration-3': await import('../migrations/migration-3'),
		};

		return migrations;
	}
}

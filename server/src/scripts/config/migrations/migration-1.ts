import type { UnknownConfigType } from '@handbrake-web/shared/types/config';
import logger from 'logging';

export default async function Migration1(config: UnknownConfigType): Promise<UnknownConfigType> {
	// Remove the 'auto-fix' config property
	if (Object.hasOwn(config.config, 'auto-fix')) {
		logger.info(`[config] [migration-1] Removing config property 'config.auto-fix'.`);
		delete config.config['auto-fix'];
	}

	// Add config version property
	if (!Object.hasOwn(config.config, 'version')) {
		logger.info(`[config] [migration-1] Creating the config property 'config.version'.`);
		config.config['version'] = 0;
	}

	// Rename 'version' section to 'application'
	if (Object.hasOwn(config, 'version')) {
		logger.info(`[config] [migration-1] Renaming section 'version' to 'application'.`);
		config['application'] = config.version;
		delete config.version;
	}

	// Rename 'check-interval' to 'update-check-interval'
	if (Object.hasOwn(config.application, 'check-interval')) {
		logger.info(
			`[config] [migration-1] Renaming property 'application.check-interval' to 'application.update-check-interval'.`
		);
		config.application['update-check-interval'] = config.application['check-interval'];
		delete config.application['check-interval'];
	}

	return config;
}

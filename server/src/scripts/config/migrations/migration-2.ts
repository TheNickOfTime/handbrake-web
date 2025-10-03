import { QueueStartupBehavior, type UnknownConfigType } from '@handbrake-web/shared/types/config';
import logger from 'logging';

export default async function Migration1(config: UnknownConfigType): Promise<UnknownConfigType> {
	// Add config version property
	if (!Object.hasOwn(config.application, 'queue-startup-behavior')) {
		logger.info(
			`[config] [migration-2] Creating the config property 'application.queue-startup-behavior'.`
		);
		config.application['queue-startup-behavior'] = QueueStartupBehavior.Previous;
	}

	return config;
}

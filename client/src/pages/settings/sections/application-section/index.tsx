import { ConfigType, QueueStartupBehavior } from '@handbrake-web/shared/types/config';
import { useContext } from 'react';
import NumberInput from '~components/base/inputs/number';
import SelectInput from '~components/base/inputs/select';
import Section from '~components/root/section';
import { SettingsContext } from '~pages/settings/context';
import styles from './styles.module.scss';

export default function SettingsApplication() {
	const { currentConfig, setCurrentConfig } = useContext(SettingsContext)!;

	const updateApplicationConfigProperty = <K extends keyof ConfigType['application']>(
		key: K,
		value: ConfigType['application'][K]
	) => {
		setCurrentConfig({
			...currentConfig,
			application: { ...currentConfig.application, [key]: value },
		});
	};

	const handleIntervalChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
		const value = parseInt(event.target.value);
		updateApplicationConfigProperty('update-check-interval', value);
	};

	const handleQueueStartupBehaviorChange: React.ChangeEventHandler<HTMLSelectElement> = (
		event
	) => {
		const value = parseInt(event.target.value);
		console.log(QueueStartupBehavior[value]);
		updateApplicationConfigProperty('queue-startup-behavior', value);
	};

	return (
		<Section heading='Application' className={styles['application']}>
			<NumberInput
				id='settings-version-check-interval'
				label='Update Check Interval (hours)'
				value={currentConfig.application['update-check-interval']}
				onChange={handleIntervalChange}
			/>
			<SelectInput
				label='Queue State On Startup'
				value={currentConfig.application['queue-startup-behavior']}
				onChange={handleQueueStartupBehaviorChange}
			>
				{Object.values(QueueStartupBehavior)
					.filter((val) => typeof val != 'string')
					.map((value) => (
						<option value={value} key={value}>
							{QueueStartupBehavior[value]}
						</option>
					))}
			</SelectInput>
		</Section>
	);
}

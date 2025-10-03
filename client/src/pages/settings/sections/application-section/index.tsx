import { ConfigType } from '@handbrake-web/shared/types/config';
import { useContext } from 'react';
import NumberInput from '~components/base/inputs/number';
import Section from '~components/root/section';
import { SettingsContext } from '~pages/settings/context';
import styles from './styles.module.scss';

export default function SettingsApplication() {
	const { currentConfig, setCurrentConfig } = useContext(SettingsContext)!;

	const updateVersionConfigProperty = <K extends keyof ConfigType['application']>(
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
		updateVersionConfigProperty('update-check-interval', value);
	};

	return (
		<Section heading='Application' className={styles['application']}>
			<NumberInput
				id='settings-version-check-interval'
				label='Update Check Interval (hours)'
				value={currentConfig.application['update-check-interval']}
				onChange={handleIntervalChange}
			/>
		</Section>
	);
}

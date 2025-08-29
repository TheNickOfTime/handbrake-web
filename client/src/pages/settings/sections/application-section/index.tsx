import { useContext } from 'react';
import NumberInput from '~components/base/inputs/number';
import Section from '~components/root/section';
import { SettingsContext } from '~pages/settings/context';
import { ConfigVersionType } from '~types/config';
import styles from './styles.module.scss';

export default function SettingsApplication() {
	const { currentConfig, setCurrentConfig } = useContext(SettingsContext)!;

	const updateVersionConfigProperty = <K extends keyof ConfigVersionType>(
		key: K,
		value: ConfigVersionType[K]
	) => {
		setCurrentConfig({ ...currentConfig, version: { ...currentConfig.version, [key]: value } });
	};

	const handleIntervalChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
		const value = parseInt(event.target.value);
		updateVersionConfigProperty('check-interval', value);
	};

	return (
		<Section heading='Application' className={styles['application']}>
			<NumberInput
				id='settings-version-check-interval'
				label='Update Check Interval (hours)'
				value={currentConfig.version['check-interval']}
				onChange={handleIntervalChange}
			/>
		</Section>
	);
}

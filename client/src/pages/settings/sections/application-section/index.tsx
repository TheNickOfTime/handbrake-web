import NumberInput from '~components/base/inputs/number';
import Section from '~components/root/section';
import { ConfigType, ConfigVersionType } from '~types/config';
import styles from './styles.module.scss';

type Params = {
	config: ConfigType;
	setConfig: React.Dispatch<React.SetStateAction<ConfigType>>;
};

export default function SettingsApplication({ config, setConfig }: Params) {
	const updateVersionConfigProperty = <K extends keyof ConfigVersionType>(
		key: K,
		value: ConfigVersionType[K]
	) => {
		setConfig({ ...config, version: { ...config.version, [key]: value } });
	};

	return (
		<Section heading='Application' className={styles['application']}>
			<NumberInput
				id='settings-version-check-interval'
				label='Update Check Interval (hours)'
				value={config.version['check-interval']}
				onChange={(value) => updateVersionConfigProperty('check-interval', value)}
			/>
		</Section>
	);
}

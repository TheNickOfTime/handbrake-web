import NumberInput from 'components/base/inputs/number/number-input';
import SubSection from 'components/section/sub-section';
import { ConfigType, ConfigVersionType } from 'types/config';

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
		<SubSection title='Application' id='application'>
			<NumberInput
				id='settings-version-check-interval'
				label='Update Check Interval (hours)'
				value={config.version['check-interval']}
				onChange={(value) => updateVersionConfigProperty('check-interval', value)}
			/>
		</SubSection>
	);
}

import ToggleInput from '~components/base/inputs/toggle';
import Section from '~components/root/section';
import { ConfigPresetsType, ConfigType } from '~types/config';
import styles from './styles.module.scss';

type Params = {
	config: ConfigType;
	setConfig: React.Dispatch<React.SetStateAction<ConfigType>>;
};

export default function SettingsPreset({ config, setConfig }: Params) {
	const updatePresetsConfigProperty = <K extends keyof ConfigPresetsType>(
		key: K,
		value: ConfigPresetsType[K]
	) => {
		setConfig({ ...config, presets: { ...config.presets, [key]: value } });
	};

	return (
		<Section heading='Presets' className={styles['presets']}>
			<ToggleInput
				id='default-preset-toggle'
				label='Show Default Presets'
				value={config.presets['show-default-presets']}
				onChange={(value) => updatePresetsConfigProperty('show-default-presets', value)}
			/>
			<ToggleInput
				id='preset-creator-toggle'
				label='Enable Preset Creator (Experimental)'
				value={config.presets['allow-preset-creator']}
				onChange={(value) => updatePresetsConfigProperty('allow-preset-creator', value)}
				disabled
			/>
		</Section>
	);
}

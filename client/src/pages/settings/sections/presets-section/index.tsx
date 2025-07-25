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
				checked={config.presets['show-default-presets']}
				onChange={(event) => {
					updatePresetsConfigProperty('show-default-presets', event.target.checked);
				}}
			/>
			{/* <ToggleInput
				id='preset-creator-toggle'
				label='Enable Preset Creator (Experimental)'
				checked={config.presets['allow-preset-creator']}
				onChange={(event) =>
					updatePresetsConfigProperty(
						'allow-preset-creator',
						event.target.value === 'true'
					)
				}
				disabled
			/> */}
		</Section>
	);
}

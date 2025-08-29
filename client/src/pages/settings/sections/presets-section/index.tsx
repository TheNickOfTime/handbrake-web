import { useContext } from 'react';
import ToggleInput from '~components/base/inputs/toggle';
import Section from '~components/root/section';
import { SettingsContext } from '~pages/settings/context';
import { ConfigPresetsType } from '~types/config';
import styles from './styles.module.scss';

export default function SettingsPreset() {
	const { currentConfig, setCurrentConfig } = useContext(SettingsContext)!;

	const updatePresetsConfigProperty = <K extends keyof ConfigPresetsType>(
		key: K,
		value: ConfigPresetsType[K]
	) => {
		setCurrentConfig({ ...currentConfig, presets: { ...currentConfig.presets, [key]: value } });
	};

	return (
		<Section heading='Presets' className={styles['presets']}>
			<ToggleInput
				id='default-preset-toggle'
				label='Show Default Presets'
				checked={currentConfig.presets['show-default-presets']}
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

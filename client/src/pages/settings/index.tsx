import ButtonInput from '~components/base/inputs/button';
import ToggleInput from '~components/base/inputs/toggle';
import Page from '~components/root/page';
import Section from '~components/root/section';
import { useContext, useEffect, useState } from 'react';
import styles from './styles.module.scss';
import SettingsApplication from './sections/application-section';
import SettingsPaths from './sections/paths-section';
import SettingsPreset from './sections/presets-section';
import { PrimaryContext } from '~layouts/primary/context';

export default function SettingsSection() {
	const { config, socket } = useContext(PrimaryContext)!;
	const [currentConfig, setCurrentConfig] = useState(config);
	const [canSave, setCanSave] = useState(false);
	const [pathsValid, setPathsValid] = useState(true);

	useEffect(() => {
		const configUpdated = JSON.stringify(config) != JSON.stringify(currentConfig);
		setCanSave(configUpdated && pathsValid);
	}, [config, currentConfig, pathsValid]);

	const handleSaveConfig = () => {
		socket.emit('config-update', currentConfig);
	};

	const handleAutoFixChange = (value: boolean) => {
		setCurrentConfig({
			...currentConfig,
			config: {
				'auto-fix': value,
			},
		});
	};

	return (
		<Page heading='Settings' className={styles['settings-section']}>
			<Section className={styles['buttons']}>
				<ButtonInput
					label='Save Configuration'
					icon='bi-floppy2-fill'
					onClick={handleSaveConfig}
					disabled={!canSave}
				/>
				<ToggleInput
					id='auto-fix-toggle'
					label='Auto-fix Configuration Errors (recommended)'
					value={currentConfig.config['auto-fix']}
					onChange={handleAutoFixChange}
				/>
			</Section>
			<div className={styles['settings-sections']}>
				<SettingsPaths
					config={currentConfig}
					setConfig={setCurrentConfig}
					setValid={setPathsValid}
				/>
				<SettingsPreset config={currentConfig} setConfig={setCurrentConfig} />
				<SettingsApplication config={currentConfig} setConfig={setCurrentConfig} />
			</div>
		</Page>
	);
}

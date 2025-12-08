import SaveIcon from '@icons/floppy2-fill.svg?react';
import { useContext, useEffect, useState } from 'react';
import ButtonInput from '~components/base/inputs/button';
import Page from '~components/root/page';
import Section from '~components/root/section';
import { PrimaryContext } from '~layouts/primary/context';
import { SettingsContext } from './context';
import SettingsApplication from './sections/application-section';
import SettingsPaths from './sections/paths-section';
import SettingsPreset from './sections/presets-section';
import styles from './styles.module.scss';

export default function SettingsPage() {
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

	return (
		<Page className={styles['settings-page']} heading='Settings'>
			<SettingsContext
				value={{
					currentConfig,
					setCurrentConfig,
					setPathsValid,
				}}
			>
				<Section className={styles['buttons']}>
					<ButtonInput
						label='Save Configuration'
						Icon={SaveIcon}
						onClick={handleSaveConfig}
						disabled={!canSave}
						title={!canSave ? 'Nothing to Save' : undefined}
					/>
					<div className={styles['status']}>
						{canSave
							? 'Unsaved configuration changes...'
							: 'Configuration is up to date.'}
					</div>
				</Section>
				<div className={styles['settings-sections']}>
					<SettingsPaths />
					<SettingsPreset />
					<SettingsApplication />
				</div>
			</SettingsContext>
		</Page>
	);
}

import Section from 'components/section/section';
import './settings.scss';
import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from 'pages/primary/primary-context';
import { useEffect, useState } from 'react';
import SubSection from 'components/section/sub-section';
import ButtonInput from 'components/base/inputs/button/button-input';
import SettingsPaths from './sub-sections/settings-paths';
import SettingsPreset from './sub-sections/settings-presets';
import ToggleInput from 'components/base/inputs/toggle/toggle-input';
import SettingsApplication from './sub-sections/settings-application';

export default function SettingsSection() {
	const { config, socket } = useOutletContext<PrimaryOutletContextType>();
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
		<Section title='Settings' id='settings-section'>
			<SubSection id='buttons'>
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
			</SubSection>
			<div className='settings-sub-sections'>
				<SettingsPaths
					config={currentConfig}
					setConfig={setCurrentConfig}
					setValid={setPathsValid}
				/>
				<SettingsPreset config={currentConfig} setConfig={setCurrentConfig} />
				<SettingsApplication config={currentConfig} setConfig={setCurrentConfig} />
			</div>
		</Section>
	);
}

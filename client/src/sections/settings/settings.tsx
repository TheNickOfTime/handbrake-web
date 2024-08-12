import Section from 'components/section/section';
import './settings.scss';
import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from 'pages/primary/primary-context';
import { useEffect, useState } from 'react';
import SubSection from 'components/section/sub-section';
import ButtonInput from 'components/base/inputs/button/button-input';
import SettingsPaths from './sub-sections/settings-paths';
import SettingsPreset from './sub-sections/settings-presets';

export default function SettingsSection() {
	const { config } = useOutletContext<PrimaryOutletContextType>();
	const [currentConfig, setCurrentConfig] = useState(config);
	const [canSave, setCanSave] = useState(false);

	useEffect(() => {
		const configUpdated = JSON.stringify(config) != JSON.stringify(currentConfig);
		setCanSave(configUpdated);
	}, [currentConfig]);

	return (
		<Section title='Settings' id='settings-section'>
			<SubSection id='buttons'>
				<div>
					<ButtonInput
						label='Save Configuration'
						icon='bi-floppy2-fill'
						onClick={() => {}}
						disabled={!canSave}
					/>
				</div>
			</SubSection>
			<div className='settings-sub-sections'>
				<SettingsPaths config={currentConfig} setConfig={setCurrentConfig} />
				<SettingsPreset config={currentConfig} setConfig={setCurrentConfig} />
			</div>
		</Section>
	);
}

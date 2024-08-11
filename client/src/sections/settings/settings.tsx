import Section from 'components/section/section';
import './settings.scss';
import { useOutletContext } from 'react-router-dom';
import { PrimaryOutletContextType } from 'pages/primary/primary-context';
import { useState } from 'react';
import SubSection from 'components/section/sub-section';
import ButtonInput from 'components/base/inputs/button/button-input';
import { ConfigType } from 'types/config';
import PresetPaths from './sub-sections/settings-paths';
import SettingsPreset from './sub-sections/settings-presets';

export default function SettingsSection() {
	const { config } = useOutletContext<PrimaryOutletContextType>();

	const [mediaPath, setMediaPath] = useState(config.paths['media-path']);
	const [inputPath, setInputPath] = useState(config.paths['input-path']);
	const [outputPath, setOutputPath] = useState(config.paths['output-path']);

	const [defaultPresets, setDefaultPresets] = useState(config.presets['show-default-presets']);
	const [presetCreator, setPresetCreator] = useState(config.presets['allow-preset-creator']);

	const newConfig: ConfigType = {
		paths: {
			'media-path': mediaPath,
			'input-path': inputPath,
			'output-path': outputPath,
		},
		presets: {
			'show-default-presets': defaultPresets,
			'allow-preset-creator': presetCreator,
		},
	};

	const canSave = JSON.stringify(newConfig) != JSON.stringify(config);
	console.log(config, newConfig, canSave);

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
				<PresetPaths
					paths={{ mediaPath: mediaPath, inputPath: inputPath, outputPath: outputPath }}
					setPaths={{
						setMediaPath: setMediaPath,
						setInputPath: setInputPath,
						setOutputPath: setOutputPath,
					}}
				/>
				<SettingsPreset
					settings={{ defaultPresets: defaultPresets, presetCreator: presetCreator }}
					setSettings={{
						setDefaultPresets: setDefaultPresets,
						setPresetCreator: setPresetCreator,
					}}
				/>
			</div>
		</Section>
	);
}

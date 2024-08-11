import ToggleInput from 'components/base/inputs/toggle/toggle-input';
import SubSection from 'components/section/sub-section';

type Params = {
	settings: {
		defaultPresets: boolean;
		presetCreator: boolean;
	};
	setSettings: {
		setDefaultPresets: React.Dispatch<React.SetStateAction<boolean>>;
		setPresetCreator: React.Dispatch<React.SetStateAction<boolean>>;
	};
};

export default function SettingsPreset({ settings, setSettings }: Params) {
	return (
		<SubSection title='Presets' id='presets'>
			<ToggleInput
				id='default-preset-toggle'
				label='Show Default Presets'
				value={settings.defaultPresets}
				setValue={setSettings.setDefaultPresets}
				disabled
			/>
			<ToggleInput
				id='preset-creator-toggle'
				label='Enable Preset Creator (Experimental)'
				value={settings.presetCreator}
				setValue={setSettings.setPresetCreator}
				disabled
			/>
		</SubSection>
	);
}

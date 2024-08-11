import PathInput from 'components/base/inputs/path/path-input';
import SubSection from 'components/section/sub-section';
import { FileBrowserMode } from 'types/file-browser';

type Params = {
	settings: {
		mediaPath: string;
		inputPath: string;
		outputPath: string;
	};
	setSettings: {
		setMediaPath: React.Dispatch<React.SetStateAction<string>>;
		setInputPath: React.Dispatch<React.SetStateAction<string>>;
		setOutputPath: React.Dispatch<React.SetStateAction<string>>;
	};
};

export default function PresetPaths({ settings, setSettings }: Params) {
	return (
		<SubSection title='Locations' id='paths'>
			<PathInput
				id='media-path-selection'
				label='Root Media Path'
				path='/'
				mode={FileBrowserMode.Directory}
				allowCreate={false}
				value={settings.mediaPath}
				onConfirm={(item) => setSettings.setMediaPath(item.path)}
			/>
			<PathInput
				id='input-path-selection'
				label='Default Input Path'
				path={settings.mediaPath}
				mode={FileBrowserMode.Directory}
				allowCreate={true}
				value={settings.inputPath}
				onConfirm={(item) => setSettings.setInputPath(item.path)}
			/>
			<PathInput
				id='output-path-selection'
				label='Default Output Path'
				path={settings.mediaPath}
				mode={FileBrowserMode.Directory}
				allowCreate={true}
				value={settings.outputPath}
				onConfirm={(item) => setSettings.setOutputPath(item.path)}
			/>
		</SubSection>
	);
}

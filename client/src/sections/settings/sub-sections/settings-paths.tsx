import PathInput from 'components/base/inputs/path/path-input';
import SubSection from 'components/section/sub-section';
import { ConfigPathsType, ConfigType } from 'types/config';
import { FileBrowserMode } from 'types/file-browser';

type Params = {
	config: ConfigType;
	setConfig: React.Dispatch<React.SetStateAction<ConfigType>>;
};

export default function SettingsPaths({ config, setConfig }: Params) {
	const updatePathProperty = <K extends keyof ConfigPathsType>(
		key: K,
		value: ConfigPathsType[K]
	) => {
		setConfig({ ...config, paths: { ...config.paths, [key]: value } });
	};

	return (
		<SubSection title='Locations' id='paths'>
			<PathInput
				id='media-path-selection'
				label='Root Media Path'
				startPath='/'
				rootPath='/'
				mode={FileBrowserMode.Directory}
				allowCreate={false}
				value={config.paths['media-path']}
				onConfirm={(item) => updatePathProperty('media-path', item.path)}
			/>
			<PathInput
				id='input-path-selection'
				label='Default Input Path'
				startPath={config.paths['input-path']}
				rootPath={config.paths['media-path']}
				mode={FileBrowserMode.Directory}
				allowCreate={true}
				value={config.paths['input-path']}
				onConfirm={(item) => updatePathProperty('input-path', item.path)}
			/>
			<PathInput
				id='output-path-selection'
				label='Default Output Path'
				startPath={config.paths['output-path'] || config.paths['media-path']}
				rootPath={config.paths['media-path']}
				mode={FileBrowserMode.Directory}
				allowCreate={true}
				value={config.paths['output-path']}
				onConfirm={(item) => updatePathProperty('output-path', item.path)}
			/>
		</SubSection>
	);
}

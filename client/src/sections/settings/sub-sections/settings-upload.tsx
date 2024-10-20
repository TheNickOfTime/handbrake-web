import PathInput from 'components/base/inputs/path/path-input';
import ToggleInput from 'components/base/inputs/toggle/toggle-input';
import SubSection from 'components/section/sub-section';
import { ConfigType, ConfigUploadType } from 'types/config';
import { FileBrowserMode } from 'types/file-browser';

type Params = {
	config: ConfigType;
	setConfig: React.Dispatch<React.SetStateAction<ConfigType>>;
};

export default function SettingsUpload({ config, setConfig }: Params) {
	const updateUploadConfigProperty = <K extends keyof ConfigUploadType>(
		key: K,
		value: ConfigUploadType[K]
	) => {
		setConfig({ ...config, upload: { ...config.upload, [key]: value } });
	};

	return (
		<SubSection title='Uploads' id='uploads'>
			<ToggleInput
				id='enable-uploads-toggle'
				label='Enable File Uploads'
				value={config.upload['allow-uploads']}
				onChange={(value) => updateUploadConfigProperty('allow-uploads', value)}
			/>
			<PathInput
				id='default-upload-path-selection'
				label='Default Upload Path'
				startPath='/'
				rootPath='/'
				mode={FileBrowserMode.Directory}
				allowCreate={false}
				value={config.upload['default-upload-path']}
				onConfirm={(item) => {
					updateUploadConfigProperty('default-upload-path', item.path);
				}}
			/>
		</SubSection>
	);
}

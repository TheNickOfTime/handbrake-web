import { useState } from 'react';
import PathInput from '~components/base/inputs/path';
import Section from '~components/root/section';
import { ConfigPathsType, ConfigType } from '~types/config';
import { FileBrowserMode } from '~types/file-browser';
import styles from './styles.module.scss';

type Params = {
	config: ConfigType;
	setConfig: React.Dispatch<React.SetStateAction<ConfigType>>;
	setValid: React.Dispatch<React.SetStateAction<boolean>>;
};

const InvalidWarning = ({ name }: { name: string }) => {
	return (
		<div className='path-invalid-warning'>
			<i className='bi bi-exclamation-circle-fill' />
			<span>Error: '{name}' needs to be a child of your 'Root Media Path'.</span>
		</div>
	);
};

export default function SettingsPaths({ config, setConfig, setValid }: Params) {
	const [validPaths, setValidPaths] = useState({
		'input-path': true,
		'output-path': true,
	});

	const updatePathProperty = <K extends keyof ConfigPathsType>(
		key: K,
		value: ConfigPathsType[K]
	) => {
		setConfig({ ...config, paths: { ...config.paths, [key]: value } });
	};

	const checkPathsValid = (paths: ConfigPathsType) => {
		const mediaPathRegex = new RegExp(`^${paths['media-path']}`);
		console.log(mediaPathRegex);

		const inputPathValid = paths['input-path'].match(mediaPathRegex);
		const outputPathValid = paths['output-path'].match(mediaPathRegex);
		const newValidPaths = {
			'input-path': inputPathValid ? true : false,
			'output-path': outputPathValid || !paths['output-path'] ? true : false,
		};

		setValid(Object.values(newValidPaths).every((value) => value));
		setValidPaths(newValidPaths);
	};

	return (
		<Section heading='Locations' className={styles['paths']}>
			<PathInput
				id='media-path-selection'
				label='Root Media Path'
				startPath='/'
				rootPath='/'
				mode={FileBrowserMode.Directory}
				allowCreate={false}
				value={config.paths['media-path']}
				onConfirm={(item) => {
					updatePathProperty('media-path', item.path);
					checkPathsValid({
						'media-path': item.path,
						'input-path': config.paths['input-path'],
						'output-path': config.paths['output-path'],
					});
				}}
			/>
			{!validPaths['input-path'] && <InvalidWarning name='Default Input Path' />}
			<PathInput
				id='input-path-selection'
				label='Default Input Path'
				startPath={config.paths['input-path']}
				rootPath={config.paths['media-path']}
				mode={FileBrowserMode.Directory}
				allowClear={true}
				allowCreate={true}
				value={config.paths['input-path']}
				onConfirm={(item) => {
					updatePathProperty('input-path', item.path);
					checkPathsValid({
						'media-path': config.paths['media-path'],
						'input-path': item.path,
						'output-path': config.paths['output-path'],
					});
				}}
			/>
			{!validPaths['output-path'] && <InvalidWarning name='Default Output Path' />}

			<PathInput
				id='output-path-selection'
				label='Default Output Path (optional)'
				startPath={config.paths['output-path'] || config.paths['media-path']}
				rootPath={config.paths['media-path']}
				mode={FileBrowserMode.Directory}
				allowClear={true}
				allowCreate={true}
				value={config.paths['output-path']}
				setValue={(value) => updatePathProperty('output-path', value)}
				onConfirm={(item) => {
					updatePathProperty('output-path', item.path);
					checkPathsValid({
						'media-path': config.paths['media-path'],
						'input-path': config.paths['input-path'],
						'output-path': item.path,
					});
				}}
			/>
		</Section>
	);
}

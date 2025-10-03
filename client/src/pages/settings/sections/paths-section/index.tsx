import { ConfigType } from '@handbrake-web/shared/types/config';
import { FileBrowserMode } from '@handbrake-web/shared/types/file-browser';
import WarningIcon from '@icons/exclamation-circle-fill.svg?react';
import { HTMLAttributes, useContext, useState } from 'react';
import PathInput from '~components/base/inputs/path';
import Section from '~components/root/section';
import { SettingsContext } from '~pages/settings/context';
import styles from './styles.module.scss';

const InvalidWarning = ({ name }: { name: string }) => {
	return (
		<div className={styles['path-invalid-warning']}>
			<WarningIcon />
			<span>Error: '{name}' needs to be a child of your 'Root Media Path'.</span>
		</div>
	);
};

export default function SettingsPaths({}: HTMLAttributes<HTMLElement>) {
	const { currentConfig, setCurrentConfig, setPathsValid } = useContext(SettingsContext)!;

	const [validPaths, setValidPaths] = useState({
		'input-path': true,
		'output-path': true,
	});

	const updatePathProperty = <K extends keyof ConfigType['paths']>(
		key: K,
		value: ConfigType['paths'][K]
	) => {
		setCurrentConfig({ ...currentConfig, paths: { ...currentConfig.paths, [key]: value } });
	};

	const checkPathsValid = (paths: ConfigType['paths']) => {
		const mediaPathRegex = new RegExp(`^${paths['media-path']}`);
		console.log(mediaPathRegex);

		const inputPathValid = paths['input-path'].match(mediaPathRegex);
		const outputPathValid = paths['output-path'].match(mediaPathRegex);
		const newValidPaths = {
			'input-path': inputPathValid ? true : false,
			'output-path': outputPathValid || !paths['output-path'] ? true : false,
		};

		setPathsValid(Object.values(newValidPaths).every((value) => value));
		setValidPaths(newValidPaths);
	};

	return (
		<Section heading='Locations' className={styles['paths-section']}>
			<PathInput
				id='media-path-selection'
				label='Root Media Path'
				startPath='/'
				rootPath='/'
				mode={FileBrowserMode.Directory}
				allowCreate={false}
				value={currentConfig.paths['media-path']}
				onConfirm={(item) => {
					updatePathProperty('media-path', item.path);
					checkPathsValid({
						'media-path': item.path,
						'input-path': currentConfig.paths['input-path'],
						'output-path': currentConfig.paths['output-path'],
					});
				}}
			/>
			{!validPaths['input-path'] && <InvalidWarning name='Default Input Path' />}
			<PathInput
				id='input-path-selection'
				label='Default Input Path'
				startPath={currentConfig.paths['input-path']}
				rootPath={currentConfig.paths['media-path']}
				mode={FileBrowserMode.Directory}
				allowClear={true}
				allowCreate={true}
				value={currentConfig.paths['input-path']}
				onConfirm={(item) => {
					updatePathProperty('input-path', item.path);
					checkPathsValid({
						'media-path': currentConfig.paths['media-path'],
						'input-path': item.path,
						'output-path': currentConfig.paths['output-path'],
					});
				}}
			/>
			{!validPaths['output-path'] && <InvalidWarning name='Default Output Path' />}

			<PathInput
				id='output-path-selection'
				label='Default Output Path (optional)'
				startPath={currentConfig.paths['output-path'] || currentConfig.paths['media-path']}
				rootPath={currentConfig.paths['media-path']}
				mode={FileBrowserMode.Directory}
				allowClear={true}
				allowCreate={true}
				value={currentConfig.paths['output-path']}
				setValue={(value) => updatePathProperty('output-path', value)}
				onConfirm={(item) => {
					updatePathProperty('output-path', item.path);
					checkPathsValid({
						'media-path': currentConfig.paths['media-path'],
						'input-path': currentConfig.paths['input-path'],
						'output-path': item.path,
					});
				}}
			/>
		</Section>
	);
}

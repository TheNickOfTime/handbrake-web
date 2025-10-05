import { FileBrowserMode } from '@handbrake-web/shared/types/file-browser';
import WarningIcon from '@icons/exclamation-circle.svg?react';
import { useContext } from 'react';
import PathInput from '~components/base/inputs/path';
import SelectInput from '~components/base/inputs/select';
import TextInput from '~components/base/inputs/text';
import { PrimaryContext } from '~layouts/primary/context';
import { JobFrom } from '../..';
import { CreateJobContext } from '../../context';
import styles from '../../styles.module.scss';

export default function OutputSection() {
	const { config } = useContext(PrimaryContext)!;
	const {
		jobFrom,
		outputPath,
		outputFiles,
		outputExtension,
		nameCollision,
		allowCollision,
		outputChanged,
		handleOutputNameChange,
		handleOutputConfirm,
		handleAllowOverwriteSelect,
	} = useContext(CreateJobContext)!;

	return (
		<fieldset className={styles['output-section']}>
			<legend>{outputChanged ? 'Output' : 'Output (Auto)'}</legend>
			<PathInput
				id='output-path'
				label='Directory: '
				startPath={
					config.paths['output-path']
						? config.paths['output-path']
						: config.paths['input-path']
				}
				rootPath={config.paths['media-path']}
				mode={FileBrowserMode.Directory}
				allowCreate={true}
				value={outputPath}
				onConfirm={handleOutputConfirm}
				key={jobFrom == JobFrom.FromFile ? 'output-file' : 'output-directory'}
			/>
			{jobFrom == JobFrom.FromFile && nameCollision && !allowCollision && (
				<span className={styles['filename-conflict']}>
					<WarningIcon />{' '}
					<span>
						This filename conflicts with an existing file in the directory. Do you want
						to overwrite it?
					</span>
				</span>
			)}
			{jobFrom == JobFrom.FromFile && nameCollision && allowCollision && (
				<span className={styles['filename-overwrite']}>
					<WarningIcon />{' '}
					<span>
						WARNING: An existing file will be <u>permanently</u> overwritten when this
						job is run.
					</span>
				</span>
			)}
			{jobFrom == JobFrom.FromFile && nameCollision && (
				<SelectInput
					id='allow-collision'
					label='Overwrite Existing File:'
					value={allowCollision ? 'yes' : 'no'}
					onChange={handleAllowOverwriteSelect}
				>
					<option value='yes'>Yes</option>
					<option value='no'>No</option>
				</SelectInput>
			)}

			{jobFrom == JobFrom.FromFile && (
				<TextInput
					id='output-name'
					label='File Name: '
					value={outputFiles[0] ? outputFiles[0].name : 'N/A'}
					onChange={handleOutputNameChange}
					disabled={!outputPath}
				/>
			)}
		</fieldset>
	);
}

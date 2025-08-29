import { useContext } from 'react';
import CheckboxInput from '~components/base/inputs/checkbox';
import PathInput from '~components/base/inputs/path';
import { PrimaryContext } from '~layouts/primary/context';
import { FileBrowserMode } from '~types/file-browser';
import { JobFrom } from '../..';
import { CreateJobContext } from '../../context';
import styles from '../../styles.module.scss';

export default function InputSection() {
	const { config } = useContext(PrimaryContext)!;
	const { jobFrom, inputPath, handleInputConfirm, isRecursive, handleRecursiveChange } =
		useContext(CreateJobContext)!;

	return (
		<fieldset className={styles['input-section']}>
			<legend>Input</legend>
			<PathInput
				id='input-path'
				label={jobFrom == JobFrom.FromFile ? 'File: ' : 'Directory: '}
				startPath={config.paths['input-path']}
				rootPath={config.paths['media-path']}
				mode={
					jobFrom == JobFrom.FromFile
						? FileBrowserMode.SingleFile
						: FileBrowserMode.Directory
				}
				value={inputPath}
				onConfirm={handleInputConfirm}
				key={jobFrom == JobFrom.FromFile ? 'input-file' : 'input-directory'}
			/>
			{jobFrom == JobFrom.FromDirectory && (
				<CheckboxInput
					id='recursive-input'
					label='Recursive:'
					value={isRecursive}
					onChange={handleRecursiveChange}
				/>
			)}
		</fieldset>
	);
}

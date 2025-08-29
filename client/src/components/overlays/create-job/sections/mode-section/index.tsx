import FileIcon from '@icons/file-earmark-fill.svg?react';
import FolderIcon from '@icons/folder-fill.svg?react';
import { useContext } from 'react';
import ButtonGroup from '~components/base/inputs/button-group';
import { JobFrom } from '../..';
import { CreateJobContext } from '../../context';
import styles from '../../styles.module.scss';

export default function ModeSection() {
	const { jobFrom, handleJobFromChange } = useContext(CreateJobContext)!;

	return (
		<ButtonGroup className={styles['mode-section']}>
			<button
				onClick={() => handleJobFromChange(JobFrom.FromFile)}
				data-selected={jobFrom == JobFrom.FromFile}
			>
				<FileIcon />
				<span>From File (Single)</span>
			</button>
			<button
				onClick={() => handleJobFromChange(JobFrom.FromDirectory)}
				data-selected={jobFrom == JobFrom.FromDirectory}
			>
				<FolderIcon />
				<span>From Folder (Bulk)</span>
			</button>
		</ButtonGroup>
	);
}

import WarningIcon from '@icons/exclamation-circle.svg?react';
import { useState } from 'react';
import ButtonInput from '~components/base/inputs/button';
import TextInput from '~components/base/inputs/text';
import { DirectoryItemsType } from '~types/directory';
import styles from './styles.module.scss';

type Params = {
	existingItems: DirectoryItemsType;
	onCancel: () => void;
	onSubmit: (directoryName: string) => void;
};

export default function AddDirectory({ existingItems, onCancel, onSubmit }: Params) {
	const [directoryName, setDirectoryName] = useState('');
	const [existingName, setExistingName] = useState(false);

	const handleNameChange = (value: string) => {
		const nameExists = existingItems
			.filter((item) => item.isDirectory)
			.map((item) => item.name)
			.includes(value);
		setExistingName(nameExists);
	};

	const handleCancel = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		onCancel();
	};

	const handleSubmit = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		onSubmit(directoryName);
	};

	const handleEnter = (value: string) => {
		if (value) {
			onSubmit(value);
		}
	};

	return (
		<div className={styles['add-directory']}>
			<div className={styles['prompt-window']}>
				<h3 className={styles['no-margin']}>Add Directory</h3>
				{existingName && (
					<span className={styles['already-exists']}>
						<WarningIcon />
						<span> Directory already exists.</span>
					</span>
				)}
				<TextInput
					id='new-directory-name'
					value={directoryName}
					setValue={setDirectoryName}
					onChange={handleNameChange}
					onSubmit={handleEnter}
				/>
				<div className={styles['buttons']}>
					<ButtonInput label='Cancel' color='red' onClick={handleCancel} />
					<ButtonInput
						label='Submit'
						color='green'
						onClick={handleSubmit}
						disabled={existingName}
					/>
				</div>
			</div>
		</div>
	);
}

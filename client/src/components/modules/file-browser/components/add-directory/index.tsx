import { DirectoryItemsType } from '@handbrake-web/shared/types/directory';
import WarningIcon from '@icons/exclamation-circle.svg?react';
import { useState } from 'react';
import ButtonInput from '~components/base/inputs/button';
import TextInput from '~components/base/inputs/text';
import styles from './styles.module.scss';

interface Properties {
	existingItems: DirectoryItemsType;
	onCancel: () => void;
	onSubmit: (directoryName: string) => void;
}

export default function AddDirectory({ existingItems, onCancel, onSubmit }: Properties) {
	const [directoryName, setDirectoryName] = useState('');
	const [existingName, setExistingName] = useState(false);

	const handleNameChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
		const value = event.target.value;

		setDirectoryName(value);

		const nameExists = existingItems
			.filter((item) => item.isDirectory)
			.map((item) => item.name)
			.includes(value);
		setExistingName(nameExists);
	};

	const handleNameSumbit: React.FormEventHandler<HTMLInputElement> = () => {
		if (directoryName) {
			onSubmit(directoryName);
		}
	};

	const handleCancel = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
		event.preventDefault();
		onCancel();
	};

	const handleSubmit: React.MouseEventHandler<HTMLButtonElement> = (event) => {
		event.preventDefault();
		onSubmit(directoryName);
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
					className={styles['directory-input']}
					id='new-directory-name'
					value={directoryName}
					onChange={handleNameChange}
					onSubmit={handleNameSumbit}
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

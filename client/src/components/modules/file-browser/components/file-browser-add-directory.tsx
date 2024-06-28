import ButtonInput from 'components/base/inputs/button/button-input';
import TextInput from 'components/base/inputs/text/text-input';
import { useState } from 'react';
import { DirectoryItems } from 'types/directory';

type Params = {
	existingItems: DirectoryItems;
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
		} else {
			console.log('pee');
		}
	};

	return (
		<div className='add-directory-prompt'>
			<div className='prompt-window'>
				<h3 className='no-margin'>Add Directory</h3>
				{existingName && (
					<span className='already-exists'>
						<i className='bi bi-exclamation-circle' />
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
				<div className='buttons'>
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

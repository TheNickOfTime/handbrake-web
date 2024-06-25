import './checkbox-input.scss';

type Params = {
	id: string;
	label?: string;
	value: boolean;
	setValue?: React.Dispatch<React.SetStateAction<boolean>>;
	onChange?: (value: boolean) => void;
};

export default function CheckboxInput({ id, label, value, setValue, onChange }: Params) {
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = event.target.checked;

		if (setValue) {
			setValue(newValue);
		}

		if (onChange) {
			onChange(newValue);
		}
	};

	return (
		<div className='checkbox-input'>
			{label && (
				<label className='checkbox-label' htmlFor={id}>
					{label}
				</label>
			)}
			<input
				type='checkbox'
				id={id}
				className='form-item'
				checked={value}
				onChange={handleChange}
			/>
		</div>
	);
}

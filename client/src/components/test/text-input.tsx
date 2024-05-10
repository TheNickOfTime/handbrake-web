type Params = {
	id: string;
	label: string;
	value: string;
	setValue: React.Dispatch<React.SetStateAction<string>>;
	readOnly?: boolean;
};

export default function TextInput({ id, label, value, setValue, readOnly = false }: Params) {
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue(event.target.value);
	};

	return (
		<div className='mb-3 d-flex flex-column '>
			<label className='form-label' htmlFor={id}>
				{label}
			</label>
			<input
				type='text'
				name={id}
				id={id}
				value={value}
				disabled={readOnly}
				onChange={handleChange}
			/>
		</div>
	);
}

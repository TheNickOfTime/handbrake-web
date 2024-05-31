import './text-input.scss';

type Params = {
	id: string;
	label?: string;
	value: string;
	setValue: React.Dispatch<React.SetStateAction<string>>;
	disabled?: boolean;
};

export default function TextInput({ id, label, value, setValue, disabled = false }: Params) {
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue(event.target.value);
	};

	return (
		<div className='text-input'>
			{label && <label htmlFor={id}>{label.trimEnd()}</label>}
			<input id={id} type='text' value={value} onChange={handleChange} disabled={disabled} />
		</div>
	);
}

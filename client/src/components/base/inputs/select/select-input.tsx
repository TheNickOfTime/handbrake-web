import { PropsWithChildren } from 'react';
import './select-input.scss';

type Params = PropsWithChildren & {
	id: string;
	label?: string;
	value: string | undefined;
	setValue: React.Dispatch<React.SetStateAction<string>>;
	onChange?: (value: string) => void;
};

export default function SelectInput({ id, label, value, setValue, onChange, children }: Params) {
	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setValue(event.target.value);
		if (onChange) {
			onChange(event.target.value);
		}
	};

	return (
		<div className='select-input'>
			{label && <label htmlFor={id}>{label.trimEnd()}</label>}
			<select
				className='form-item'
				id={id}
				value={value ? value : 'N/A'}
				onChange={handleChange}
			>
				{children}
			</select>
		</div>
	);
}

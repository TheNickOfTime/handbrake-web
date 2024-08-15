import { PropsWithChildren } from 'react';
import './select-input.scss';
import { EndWithColon } from 'funcs/string.funcs';

type Params = PropsWithChildren & {
	id: string;
	label?: string;
	value: any;
	setValue?: React.Dispatch<React.SetStateAction<any>>;
	onChange?: (value: string) => void;
};

export default function SelectInput({ id, label, value, setValue, onChange, children }: Params) {
	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		if (setValue) {
			setValue(event.target.value);
		}
		if (onChange) {
			onChange(event.target.value);
		}
	};

	return (
		<div className='select-input'>
			{label && <label htmlFor={id}>{EndWithColon(label)}</label>}
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

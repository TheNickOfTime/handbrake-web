import { PropsWithChildren } from 'react';
import './select-input.scss';

type Params = PropsWithChildren & {
	id: string;
	label?: string;
	value: string;
	setValue: React.Dispatch<React.SetStateAction<string>>;
};

export default function SelectInput({ id, label, value, setValue, children }: Params) {
	const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setValue(event.target.value);
	};

	return (
		<div className='select-input'>
			{label && <label htmlFor={id}>{label.trimEnd()}</label>}
			<select id={id} value={value} onChange={handleChange}>
				{children}
			</select>
		</div>
	);
}

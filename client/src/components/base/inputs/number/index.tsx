import React from 'react';
import { EndWithColon } from '~funcs/string.funcs';
import styles from './styles.module.scss';

type Params = {
	id: string;
	label: string;
	value: number;
	setValue?: React.Dispatch<React.SetStateAction<number>>;
	onChange?: (value: number) => void;
	step?: number;
	min?: number;
	max?: number;
	disabled?: boolean;
};

export default function NumberInput({
	id,
	label,
	value,
	setValue,
	onChange,
	step,
	min,
	max,
	disabled,
}: Params) {
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (setValue) {
			setValue(parseInt(event.target.value));
		}
		if (onChange) {
			onChange(parseInt(event.target.value));
		}
	};

	return (
		<div className={`number-input ${styles['number-input']}`}>
			{label && <label htmlFor={id}>{EndWithColon(label)}</label>}
			<input
				type='number'
				id={id}
				step={step}
				min={min || 0}
				max={max}
				value={value}
				onChange={handleChange}
				disabled={disabled}
			/>
		</div>
	);
}

import { InputHTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value'> {
	label?: string;
	value?: boolean;
}

export default function CheckboxInput({ label, value, className, ...properties }: Properties) {
	return (
		<div className={`checkbox-input ${styles['checkbox-input']} ${className || ''}`}>
			{label && <label htmlFor={'checkbox-input'}>{label}</label>}
			<input
				type='checkbox'
				id={'checkbox-input'}
				value={value ? String(value) : undefined}
				{...properties}
			/>
		</div>
	);
}

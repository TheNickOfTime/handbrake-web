import { EndWithColon } from '@handbrake-web/shared/funcs/string.funcs';
import { InputHTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends InputHTMLAttributes<HTMLInputElement> {
	label: string;
	step?: string | number;
}

export default function NumberInput({ label, className, id, step = 1, ...properties }: Properties) {
	return (
		<div className={`number-input ${styles['number-input']}`}>
			{label && <label htmlFor={id || 'number-input'}>{EndWithColon(label)}</label>}
			<input type='number' id={id || 'number-input'} step={step} {...properties} />
		</div>
	);
}

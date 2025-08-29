import { InputHTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
}

export default function CheckboxInput({ label, className, ...properties }: Properties) {
	return (
		<div className={`checkbox-input ${styles['checkbox-input']} ${className || ''}`}>
			{label && <label htmlFor={'checkbox-input'}>{label}</label>}
			<input type='checkbox' id={'checkbox-input'} {...properties} />
		</div>
	);
}

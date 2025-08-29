import { InputHTMLAttributes } from 'react';
import { EndWithColon } from '~funcs/string.funcs';
import styles from './styles.module.scss';

interface Properties extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
}

export default function TextInput({ label, className, id, ...properties }: Properties) {
	return (
		<div className={`text-input ${styles['text-input']} ${className || ''}`}>
			{label && (
				<label className={styles['label']} htmlFor='text-input'>
					{EndWithColon(label)}
				</label>
			)}
			<input
				className={styles['input']}
				id={`text-input ${id || ''}`}
				type='text'
				size={1}
				{...properties}
			/>
		</div>
	);
}

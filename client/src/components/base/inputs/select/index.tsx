import { EndWithColon } from '@handbrake-web/shared/funcs/string.funcs';
import { SelectHTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
}

export default function SelectInput({ label, className, children, ...properties }: Properties) {
	return (
		<div className={`select-input ${styles['select-input']} ${className || ''}`}>
			{label && (
				<label className={styles['label']} htmlFor='select-input'>
					{EndWithColon(label)}
				</label>
			)}
			<select className={styles['input']} {...properties}>
				{children}
			</select>
		</div>
	);
}

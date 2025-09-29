import { EndWithColon } from '@handbrake-web/shared/funcs/string.funcs';
import { InputHTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
}

export default function ToggleInput({ label, ...properties }: Properties) {
	return (
		<div className={`toggle-input ${styles['toggle-input']}`}>
			{label && (
				<label className={styles['label']} htmlFor='checkbox-input'>
					{EndWithColon(label)}
				</label>
			)}
			<label className={styles['checkbox-wrapper']}>
				<input type='checkbox' id='checkbox-input' {...properties} />
			</label>
		</div>
	);
}

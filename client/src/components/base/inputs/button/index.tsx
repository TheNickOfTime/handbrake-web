import { ButtonHTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends ButtonHTMLAttributes<HTMLButtonElement> {
	label?: string;
	icon?: string;
	color?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'magenta';
}

export default function ButtonInput({ label, icon, color, ...properties }: Properties) {
	return (
		<button
			className={`controlled-button ${styles['controlled-button']}`}
			{...properties}
			data-color={color}
		>
			{icon && <i className={`button-icon bi ${icon}`} />}
			{label && <span className='button-label'>{label}</span>}
		</button>
	);
}

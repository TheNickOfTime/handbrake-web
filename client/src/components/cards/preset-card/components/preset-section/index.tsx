import { HTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {
	label: string;
}

export default function PresetSection({ label, className, children, ...properties }: Properties) {
	return (
		<div className={styles['preset-section']} {...properties}>
			<div className={styles['heading']}>{label}</div>
			{children}
		</div>
	);
}

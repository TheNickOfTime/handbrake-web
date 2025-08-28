import { HTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {
	label: string;
	vertical?: boolean;
}

export default function TextInfo({
	label,
	vertical = false,
	className,
	children,
	...properties
}: Properties) {
	return (
		<div
			className={`${styles['text-info']} ${className || ''}`}
			data-vertical={vertical}
			{...properties}
		>
			<span className={styles['label']}>{label}:</span>
			<span className={styles['content']}>{children}</span>
		</div>
	);
}

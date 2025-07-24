import { HTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {
	label: string;
	vertical?: boolean;
}

export default function TextInfo({ label, vertical = false, children }: Properties) {
	return (
		<div className={`${styles['text-info']} ${vertical ? styles['vertical'] : ''}`}>
			<span className={styles['label']}>{label}:</span>
			<span className={styles['content']}>{children}</span>
		</div>
	);
}

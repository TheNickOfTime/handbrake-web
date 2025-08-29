import { HTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {
	percentage: number;
}

export default function ProgressBar({ percentage, className, ...properties }: Properties) {
	return (
		<div
			className={`progress-bar ${styles['progress-bar']} ${className || ''}`}
			{...properties}
		>
			<span className={styles['value']} style={{ width: `${percentage}%` }} />
			<span className={styles['label']}>{percentage.toFixed(2)} %</span>
		</div>
	);
}

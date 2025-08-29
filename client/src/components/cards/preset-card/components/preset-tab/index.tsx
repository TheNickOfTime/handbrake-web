import { HTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {}

export default function PresetTab({ className, children, ...properties }: Properties) {
	return (
		<div className={`preset-tab ${styles['preset-tab']} ${className || ''}`} {...properties}>
			{children}
		</div>
	);
}

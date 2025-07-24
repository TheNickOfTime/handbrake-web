import { HTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {}

export default function PresetTab({ className, children, ...properties }: Properties) {
	return (
		<div className={styles['preset-tab']} {...properties}>
			{children}
		</div>
	);
}

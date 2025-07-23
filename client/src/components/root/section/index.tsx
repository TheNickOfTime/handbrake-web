import { HTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {
	heading?: string;
}

export default function Section({ heading, className, children, ...properties }: Properties) {
	return (
		<div className={`section ${styles['section']} ${className || ''}`} {...properties}>
			{heading && <h2 className={styles['heading']}>{heading}</h2>}
			{children}
		</div>
	);
}

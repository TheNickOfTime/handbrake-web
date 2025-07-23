import { HTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {}

export default function ButtonGroup({ children, ...properties }: Properties) {
	return (
		<div className={`button-group ${styles['button-group']}`} {...properties}>
			{children}
		</div>
	);
}

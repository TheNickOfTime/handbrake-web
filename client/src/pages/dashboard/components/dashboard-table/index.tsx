import { HTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {}

export default function DashboardTable({ children, ...properties }: Properties) {
	return (
		<div className={styles['dashboard-table']} {...properties}>
			<table>{children}</table>
		</div>
	);
}

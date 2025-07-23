import { HTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {
	label: string;
	vertical?: boolean;
}

export default function TextInfo({ label, vertical = false, children }: Properties) {
	return (
		<div className={`${styles['text-info']}${vertical ? ` ${styles['vertical']}` : ''}`}>
			<span className='text-info-label'>{label}:</span>
			<span className='text-info-content'>{children}</span>
		</div>
	);
}

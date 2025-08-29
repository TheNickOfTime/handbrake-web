import { HTMLAttributes } from 'react';
import BadgeInfo from '~components/base/info/badge-info';
import styles from '../styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {
	label: string;
}

export default function QueueCardSection({ children, label, title, ...properties }: Properties) {
	return (
		<div
			className={styles['job-section']}
			id={label.toLowerCase().replace(/\s/g, '-')}
			{...properties}
		>
			<h5 className={styles['job-section-label']}>
				<span>{label}</span>
				{title && <BadgeInfo className={styles['badge']} info={title} />}
			</h5>
			<hr />
			<div className={styles['job-section-children']}>{children}</div>
		</div>
	);
}

import LinkIcon from '@icons/arrow-right-short.svg?react';
import { Link } from '@tanstack/react-router';
import { HTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {
	heading?: string;
	link?: string;
}

export default function Section({ heading, link, className, children, ...properties }: Properties) {
	const headingComponent = <h2 className={styles['heading']}>{heading}</h2>;

	return (
		<div className={`section ${styles['section']} ${className || ''}`} {...properties}>
			{heading && !link && headingComponent}
			{heading && link && (
				<Link to={link} className={styles['link']}>
					{headingComponent}
					<LinkIcon className={styles['icon']} />
				</Link>
			)}
			{children}
		</div>
	);
}

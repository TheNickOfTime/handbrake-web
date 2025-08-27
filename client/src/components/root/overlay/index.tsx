import { HTMLAttributes, useContext } from 'react';
import { PageContext } from '../page/context';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {}

export default function Overlay({ className, children, ...properties }: Properties) {
	const { scrollY } = useContext(PageContext);

	return (
		<div
			className={`overlay ${styles['overlay']} ${className || ''}`}
			style={{ top: scrollY }}
			{...properties}
		>
			<div className={styles['window']}>{children}</div>
		</div>
	);
}

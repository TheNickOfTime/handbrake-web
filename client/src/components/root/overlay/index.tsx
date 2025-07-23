import { HTMLAttributes, useContext } from 'react';
import { PageContext } from '../page/context';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {}

export default function Overlay({ children, ...properties }: Properties) {
	const { scrollY } = useContext(PageContext);

	return (
		<div className={styles['overlay']} style={{ top: scrollY }} {...properties}>
			<div className={styles['window']}>{children}</div>
		</div>
	);
}

import { ButtonHTMLAttributes, FunctionComponent } from 'react';
import styles from './styles.module.scss';

interface Properties extends ButtonHTMLAttributes<HTMLButtonElement> {
	label?: string;
	Icon?: FunctionComponent<React.SVGProps<SVGSVGElement>>;
	color?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'magenta';
	title?: string;
}

export default function ButtonInput({ label, Icon, color, ...properties }: Properties) {
	return (
		<button className={`button ${styles['button']}`} {...properties} data-color={color}>
			{Icon && <Icon className={styles['icon']} />}
			{label && <span className={styles['label']}>{label}</span>}
		</button>
	);
}

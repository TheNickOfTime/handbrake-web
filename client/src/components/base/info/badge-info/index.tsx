import InfoIcon from '@icons/info-circle-fill.svg?react';
import { HTMLAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {
	info: string;
}

export default function BadgeInfo({ info, className, ...properties }: Properties) {
	return (
		<div className={`${styles['badge-info']} ${className || ''}`} title={info} {...properties}>
			<InfoIcon />
		</div>
	);
}

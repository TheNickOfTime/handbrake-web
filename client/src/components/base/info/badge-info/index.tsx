import InfoIcon from '@icons/info-circle-fill.svg?react';
import { SVGAttributes } from 'react';
import styles from './styles.module.scss';

interface Properties extends SVGAttributes<SVGElement> {
	info: string;
}

export default function BadgeInfo({ info, ...properties }: Properties) {
	return <InfoIcon className={styles['queue-job-outer']} title={info} {...properties} />;
}

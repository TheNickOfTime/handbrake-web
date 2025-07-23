import styles from './styles.module.scss';

type Params = {
	percentage: number;
};

export default function ProgressBar({ percentage }: Params) {
	return (
		<div className={styles['progress-bar']}>
			<span className={styles['progress-value']} style={{ width: `${percentage}%` }} />
			<span className={styles['progress-label']}>{percentage.toFixed(2)} %</span>
		</div>
	);
}

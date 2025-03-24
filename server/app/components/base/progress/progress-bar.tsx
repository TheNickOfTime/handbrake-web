import './progress-bar.scss';

type Params = {
	percentage: number;
};

export default function ProgressBar({ percentage }: Params) {
	return (
		<div className='progress-bar'>
			<span className='progress-value' style={{ width: `${percentage}%` }} />
			<span className='progress-label'>{percentage.toFixed(2)} %</span>
		</div>
	);
}

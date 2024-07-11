import { PropsWithChildren } from 'react';
import './queue-job-section.scss';

type Params = PropsWithChildren & {
	label: string;
};

export default function QueueJobSection({ children, label }: Params) {
	return (
		<div className={`job-section`} id={label.toLowerCase().replace(/\s/g, '-')}>
			<h5 className='job-section-label'>{label}</h5>
			<hr />
			<div className='job-section-children'>{children}</div>
		</div>
	);
}

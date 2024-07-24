import { PropsWithChildren } from 'react';

type Params = PropsWithChildren & {
	label: string;
};

export default function QueueCardSection({ children, label }: Params) {
	return (
		<div className={`job-section`} id={label.toLowerCase().replace(/\s/g, '-')}>
			<h5 className='job-section-label'>{label}</h5>
			<hr />
			<div className='job-section-children'>{children}</div>
		</div>
	);
}

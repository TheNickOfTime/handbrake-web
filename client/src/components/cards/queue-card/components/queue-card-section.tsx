import { PropsWithChildren } from 'react';

type Params = PropsWithChildren & {
	label: string;
	title?: string;
};

export default function QueueCardSection({ children, label, title }: Params) {
	return (
		<div className={`job-section`} id={label.toLowerCase().replace(/\s/g, '-')}>
			<h5 className='job-section-label'>
				<span>{label}</span>
				{title && <i className='bi bi-info-circle-fill' title={title} />}
			</h5>
			<hr />
			<div className='job-section-children'>{children}</div>
		</div>
	);
}

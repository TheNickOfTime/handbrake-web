import { PropsWithChildren } from 'react';
import BadgeInfo from '~components/base/info/badge-info';

type Params = PropsWithChildren & {
	label: string;
	title?: string;
};

export default function QueueCardSection({ children, label, title }: Params) {
	return (
		<div className={`job-section`} id={label.toLowerCase().replace(/\s/g, '-')}>
			<h5 className='job-section-label'>
				<span>{label}</span>
				{title && <BadgeInfo info={title} />}
			</h5>
			<hr />
			<div className='job-section-children'>{children}</div>
		</div>
	);
}

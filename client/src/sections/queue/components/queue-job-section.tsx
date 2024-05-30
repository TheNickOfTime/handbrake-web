import { PropsWithChildren } from 'react';
import './queue-job-section.scss';

type Params = PropsWithChildren & {
	label: string;
};

export default function QueueJobSection({ children, label }: Params) {
	return (
		<div className={`job-section ${label.toLowerCase()}`}>
			<h4>{label}</h4>
			<hr />
			{children}
		</div>
	);
}

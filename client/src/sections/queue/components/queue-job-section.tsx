import { PropsWithChildren } from 'react';
import './queue-job-section.scss';

type Params = PropsWithChildren & {
	label: string;
};

export default function QueueJobSection({ children, label }: Params) {
	return (
		<div className={`job-section`} id={label.toLowerCase()}>
			<h5>{label}</h5>
			<hr />
			<div>{children}</div>
		</div>
	);
}

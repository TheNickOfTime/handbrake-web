import { PropsWithChildren } from 'react';
import './section-overlay.scss';

type Params = PropsWithChildren & {
	id: string;
};

export default function SectionOverlay({ children, id }: Params) {
	return (
		<div className='section-overlay' id={id}>
			<div className='section-overlay-window'>{children}</div>
		</div>
	);
}

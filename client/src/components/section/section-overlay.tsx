import { PropsWithChildren, useContext } from 'react';
import './section-overlay.scss';
import { SectionContext } from './section-context';

type Params = PropsWithChildren & {
	id: string;
};

export default function SectionOverlay({ children, id }: Params) {
	const { scrollY } = useContext(SectionContext);

	return (
		<div className='section-overlay' id={id} style={{ top: scrollY }}>
			<div className='section-overlay-window'>{children}</div>
		</div>
	);
}

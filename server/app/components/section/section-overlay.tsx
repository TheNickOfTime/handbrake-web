import { PropsWithChildren, useContext } from 'react';
import { SectionContext } from './section-context';
import './section-overlay.scss';

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

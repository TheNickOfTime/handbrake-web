/* eslint-disable @typescript-eslint/no-explicit-any */

import { PropsWithChildren, useRef, useState } from 'react';
import './section.scss';
import { SectionContext, SectionContextType } from './section-context';

type Params = PropsWithChildren & {
	title: string;
	className?: string;
	id?: string;
};

export default function Section({ children, title, className, id }: Params) {
	const [scrollY, setScrollY] = useState(0);
	const scrollRef = useRef<null | HTMLDivElement>(null);

	const context: SectionContextType = {
		scrollY: scrollY,
	};

	const handleScroll = () => {
		if (scrollRef.current) {
			setScrollY(scrollRef.current.scrollTop);
			console.log(scrollRef.current.scrollTop);
		}
	};

	return (
		<div
			className={'section' + (className ? ' ' + className : '')}
			id={id}
			ref={scrollRef}
			onScroll={handleScroll}
		>
			<h1 className='section-title'>{title}</h1>
			<hr className='section-divider' />
			<SectionContext.Provider value={context}>{children}</SectionContext.Provider>
		</div>
	);
}

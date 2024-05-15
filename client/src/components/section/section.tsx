/* eslint-disable @typescript-eslint/no-explicit-any */

import { PropsWithChildren } from 'react';
import './section.scss';

type Params = PropsWithChildren & {
	title: string;
	id: string;
};

export default function Section({ children, title, id }: Params) {
	return (
		<div className='section' id={id}>
			<h1 className='section-title'>{title}</h1>
			<hr className='section-divider' />
			{children}
		</div>
	);
}

/* eslint-disable @typescript-eslint/no-explicit-any */

import { PropsWithChildren } from 'react';
import './sub-section.scss';

type Params = PropsWithChildren & {
	title?: string;
	id: string;
};

export default function SubSection({ children, title, id }: Params) {
	return (
		<div className='sub-section' id={id}>
			{title && <h2 className='sub-section-title'>{title}</h2>}
			{children}
		</div>
	);
}

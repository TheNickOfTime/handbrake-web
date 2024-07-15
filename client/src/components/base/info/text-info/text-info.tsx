import { PropsWithChildren } from 'react';
import './text-info.scss';

type Params = {
	label: string;
	vertical?: boolean;
} & PropsWithChildren;

export default function TextInfo({ label, children, vertical = false }: Params) {
	return (
		<div className='text-info'>
			<span className='text-info-label'>{label}:</span>
			<span className={'text-info-content' + vertical ? 'vertical' : undefined}>
				{children}
			</span>
		</div>
	);
}

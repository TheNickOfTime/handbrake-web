import { PropsWithChildren } from 'react';
import './overlay-window.scss';

type Params = PropsWithChildren & {
	className: string;
};

export default function OverlayWindow({ children, className }: Params) {
	return (
		<div className='overlay-window'>
			<div className={`overlay-window-inner ${className}`}>{children}</div>
		</div>
	);
}

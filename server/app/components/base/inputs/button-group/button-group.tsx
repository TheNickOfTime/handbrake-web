import { PropsWithChildren } from 'react';
import './button-group.scss';

export default function ButtonGroup({ children }: PropsWithChildren) {
	return <div className='button-group'>{children}</div>;
}

import { HTMLAttributes, useRef, useState } from 'react';
import { PageContext, PageContextType } from './context';
import styles from './styles.module.scss';

interface Properties extends HTMLAttributes<HTMLDivElement> {
	heading: string;
}

export default function Page({ heading, className, children, ...properties }: Properties) {
	const [scrollY, setScrollY] = useState(0);
	const scrollRef = useRef<null | HTMLDivElement>(null);

	const context: PageContextType = {
		scrollY: scrollY,
	};

	const handleScroll = () => {
		if (scrollRef.current) {
			setScrollY(scrollRef.current.scrollTop);
			// console.log(scrollRef.current.scrollTop);
		}
	};

	return (
		<main
			className={`page ${styles['page']} ${className ? className : ''}`}
			ref={scrollRef}
			onScroll={handleScroll}
			{...properties}
		>
			<h1 className={styles['heading']}>{heading}</h1>
			<hr className={styles['divider']} />
			<PageContext value={context}>{children}</PageContext>
		</main>
	);
}

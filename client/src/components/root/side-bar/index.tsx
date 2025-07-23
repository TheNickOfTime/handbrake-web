import WatchersIcon from '@icons/eye-fill.svg?react';
import SettingsIcon from '@icons/gear-fill.svg?react';
import QueueIcon from '@icons/list-ol.svg?react';
import MenuIcon from '@icons/list.svg?react';
import WorkersIcon from '@icons/robot.svg?react';
import PresetsIcon from '@icons/sliders.svg?react';
import DashboardIcon from '@icons/speedometer.svg?react';
import { Link } from '@tanstack/react-router';
import { FunctionComponent, SVGProps, useState } from 'react';
import { Socket } from 'socket.io-client';
import { ConfigType } from '~types/config';
import VersionInfo from './components/version-info';
import styles from './styles.module.scss';

const navigationItems: {
	Icon: FunctionComponent<SVGProps<SVGSVGElement>>;
	label: string;
	link: string;
}[] = [
	{
		Icon: DashboardIcon,
		label: 'Dashboard',
		link: '/',
	},
	{
		Icon: QueueIcon,
		label: 'Queue',
		link: '/queue',
	},
	{
		Icon: PresetsIcon,
		label: 'Presets',
		link: '/presets',
	},
	{
		Icon: WatchersIcon,
		label: 'Watchers',
		link: '/watchers',
	},
	{
		Icon: WorkersIcon,
		label: 'Workers',
		link: '/workers',
	},
	{
		Icon: SettingsIcon,
		label: 'Settings',
		link: '/settings',
	},
];

interface Properties {
	showSidebar: boolean;
	setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
	socket: Socket;
	config: ConfigType | undefined;
}

export default function SideBar({ showSidebar, setShowSidebar, socket, config }: Properties) {
	const [isExpanded, setIsExpanded] = useState(false);

	const onMenuButtonClick = () => {
		setIsExpanded(!isExpanded);
	};

	const handleLinkClick = () => {
		if (isExpanded) {
			setIsExpanded(false);
		}
	};

	return (
		<div className={styles['sidebar']} data-expanded={isExpanded}>
			<header className={styles['header']}>
				<img className={styles['icon']} src='/handbrake-icon.png' alt='HandBrake Icon' />
				<h1 className={styles['heading']}>HandBrake Web</h1>
				<button className={styles['button']} onClick={onMenuButtonClick}>
					<MenuIcon />
				</button>
			</header>
			<div className={styles['menu']}>
				<div className={styles['wrapper-outer']}>
					<div className={styles['wrapper-inner']}>
						<nav className={styles['navigation']}>
							<ul className={styles['nav-items']}>
								{navigationItems.map(({ Icon, label, link }, index) => (
									<li className={styles['nav-item']} key={index}>
										<Link
											className={styles['nav-link']}
											to={link}
											onClick={handleLinkClick}
										>
											<Icon className={styles['icon']} />
											<span className={styles['label']}>{label}</span>
										</Link>
									</li>
								))}
							</ul>
						</nav>
						<footer className={styles['footer']}>
							<VersionInfo socket={socket} config={config} />
						</footer>
					</div>
				</div>
			</div>
		</div>
	);
}

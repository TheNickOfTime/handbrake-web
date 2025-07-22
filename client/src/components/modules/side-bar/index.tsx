import { Link } from '@tanstack/react-router';
import { Socket } from 'socket.io-client';
import { ConfigType } from 'types/config';
import VersionInfo from '../version-info/version-info';
import styles from './styles.module.scss';

type Params = {
	showSidebar: boolean;
	setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
	socket: Socket;
	config: ConfigType | undefined;
};

export default function SideBar({ showSidebar, setShowSidebar, socket, config }: Params) {
	const handleLinkClick = () => {
		if (showSidebar) {
			setShowSidebar(false);
		}
	};

	return (
		<div className={`${styles['side-bar']} ${showSidebar ? 'expanded' : ''}`}>
			<div className={styles['side-bar-background']} />
			<div className={styles['side-bar-inner']}>
				<div className={styles['side-bar-header']}>
					<img
						className={styles['side-bar-header-icon']}
						src='/handbrake-icon.png'
						alt='HandBrake Icon'
					/>
					<h2>HandBrake Web</h2>
				</div>
				<div className={styles['side-bar-nav']}>
					<ul>
						<li>
							<Link to='/' onClick={handleLinkClick}>
								<i className='bi bi-speedometer' />
								Dashboard
							</Link>
						</li>
						<li>
							<Link to='/queue' onClick={handleLinkClick}>
								<i className='bi bi-list-ol' />
								Queue
							</Link>
						</li>
						<li>
							<Link to='/presets' onClick={handleLinkClick}>
								<i className='bi bi-sliders' />
								Presets
							</Link>
						</li>
						<li>
							<Link to='/watchers' onClick={handleLinkClick}>
								<i className='bi bi-eye-fill' />
								Watchers
							</Link>
						</li>
						<li>
							<Link to='/workers' onClick={handleLinkClick}>
								<i className='bi bi-robot' />
								Workers
							</Link>
						</li>
						<li>
							<Link to='/settings' onClick={handleLinkClick}>
								<i className='bi bi-gear-fill' />
								Settings
							</Link>
						</li>
					</ul>
				</div>
				<div className={styles['side-bar-application-version']}>
					<VersionInfo socket={socket} config={config} />
				</div>
			</div>
		</div>
	);
}

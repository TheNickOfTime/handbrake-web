import { NavLink, useOutletContext } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { ConfigType } from 'types/config';
import VersionInfo from '../version-info/version-info';
import './side-bar.scss';
import { PrimaryOutletContextType } from 'pages/primary/primary-context';

type Params = {
	showSidebar: boolean;
	setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
	socket: Socket;
	config: ConfigType | undefined;
};

export default function SideBar({ showSidebar, setShowSidebar, socket, config }: Params) {
	const handleNavLinkClick = () => {
		if (showSidebar) {
			setShowSidebar(false);
		}
	};

	return (
		<div className={`side-bar ${showSidebar ? 'expanded' : ''}`}>
			<div className='side-bar-background' />
			<div className='side-bar-inner'>
				<div className='side-bar-header'>
					<img
						className='side-bar-header-icon'
						src='/handbrake-icon.png'
						alt='HandBrake Icon'
					/>
					<h2>HandBrake Web</h2>
				</div>
				<div className='side-bar-nav'>
					<ul>
						<li>
							<NavLink to='/' onClick={handleNavLinkClick}>
								<i className='bi bi-speedometer' />
								Dashboard
							</NavLink>
						</li>
						<li>
							<NavLink to='/queue' onClick={handleNavLinkClick}>
								<i className='bi bi-list-ol' />
								Queue
							</NavLink>
						</li>
						<li>
							<NavLink to='/presets' onClick={handleNavLinkClick}>
								<i className='bi bi-sliders' />
								Presets
							</NavLink>
						</li>
						<li>
							<NavLink to='/watchers' onClick={handleNavLinkClick}>
								<i className='bi bi-eye-fill' />
								Watchers
							</NavLink>
						</li>
						<li>
							<NavLink to='/workers' onClick={handleNavLinkClick}>
								<i className='bi bi-robot' />
								Workers
							</NavLink>
						</li>
						{config?.upload['allow-uploads'] && (
							<li>
								<NavLink to='/uploads' onClick={handleNavLinkClick}>
									<i className='bi bi-upload' />
									Uploads
								</NavLink>
							</li>
						)}
						<li>
							<NavLink to='/settings' onClick={handleNavLinkClick}>
								<i className='bi bi-gear-fill' />
								Settings
							</NavLink>
						</li>
					</ul>
				</div>
				<div className='side-bar-application-version'>
					<VersionInfo socket={socket} config={config} />
				</div>
			</div>
		</div>
	);
}

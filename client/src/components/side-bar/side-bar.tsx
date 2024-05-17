import { NavLink } from 'react-router-dom';
import './side-bar.scss';

type Params = {
	showSidebar: boolean;
};

export default function SideBar({ showSidebar }: Params) {
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
							<NavLink to='/'>Dashboard</NavLink>
						</li>
						<li>
							<NavLink to='/queue'>Queue</NavLink>
						</li>
						<li>
							<NavLink to='/workers'>Workers</NavLink>
						</li>
						<li>
							<NavLink to='/presets'>Presets</NavLink>
						</li>
						{/* <li>
						<NavLink to='/workers'>Workers</NavLink>
					</li>
					<li>
						<NavLink to='/presets'>Presets</NavLink>
					</li> */}
					</ul>
				</div>
			</div>
		</div>
	);
}

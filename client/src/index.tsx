import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouteObject, RouterProvider } from 'react-router';

import '@fontsource/inter';
import '@fontsource/noto-sans';
import './index.scss';

import Primary from 'pages/primary/primary';
import DashboardSection from 'sections/dashboard/dashboard';
import Error from 'sections/error/error';
import PresetsSection from 'sections/presets/presets';
import QueueSection from 'sections/queue/queue';
import SettingsSection from 'sections/settings/settings';
import WatchersSection from 'sections/watchers/watchers';
import WorkersSection from 'sections/workers/workers';

const routes: RouteObject[] = [
	{
		path: '/',
		element: <Primary />,
		errorElement: <Error />,
		children: [
			{
				path: '',
				element: <DashboardSection />,
			},
			{
				path: 'queue',
				element: <QueueSection />,
			},
			{
				path: 'workers',
				element: <WorkersSection />,
			},
			{
				path: 'presets',
				element: <PresetsSection />,
			},
			{
				path: 'watchers',
				element: <WatchersSection />,
			},
			{
				path: 'settings',
				element: <SettingsSection />,
			},
			{
				path: '*',
				element: <Error />,
				errorElement: <Error />,
			},
		],
	},
];
const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);

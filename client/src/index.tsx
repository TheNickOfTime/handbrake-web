import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouteObject, RouterProvider } from 'react-router-dom';

import './index.scss';
import '@fontsource/noto-sans';
import '@fontsource/inter';

import Primary from './pages/primary/primary';
import Error from './sections/error/error';
import QueueSection from './sections/queue/queue';
import WorkersSection from './sections/workers/workers';
import PresetsSection from './sections/presets/presets';
import DashboardSection from './sections/dashboard/dashboard';

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
				path: '*',
				element: <Error />,
				errorElement: <Error />,
			},
		],
	},
];
const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root')!).render(<RouterProvider router={router} />);

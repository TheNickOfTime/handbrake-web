import { index, layout, route, type RouteConfig } from '@react-router/dev/routes';

export default [
	layout('./pages/primary/primary.tsx', [
		index('./sections/dashboard/dashboard.tsx'),
		route('queue', './sections/queue/queue.tsx'),
		route('workers', './sections/workers/workers.tsx'),
		route('presets', './sections/presets/presets.tsx'),
		route('watchers', './sections/watchers/watchers.tsx'),
		route('settings', './sections/settings/settings.tsx'),
	]),
] satisfies RouteConfig;

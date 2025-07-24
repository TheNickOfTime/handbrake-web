import { createFileRoute } from '@tanstack/react-router';
import WatchersPage from '~pages/watchers';

export const Route = createFileRoute('/watchers')({
	component: WatchersPage,
});

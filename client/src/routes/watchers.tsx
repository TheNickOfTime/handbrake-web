import { createFileRoute } from '@tanstack/react-router';
import WatchersSection from '~pages/watchers';

export const Route = createFileRoute('/watchers')({
	component: WatchersSection,
});

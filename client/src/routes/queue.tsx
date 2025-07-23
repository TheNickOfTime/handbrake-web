import { createFileRoute } from '@tanstack/react-router';
import QueueSection from '~pages/queue';

export const Route = createFileRoute('/queue')({
	component: QueueSection,
});

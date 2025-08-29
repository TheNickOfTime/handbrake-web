import { createFileRoute } from '@tanstack/react-router';
import WorkersPage from '~pages/workers';

export const Route = createFileRoute('/workers')({
	component: WorkersPage,
});

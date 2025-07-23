import { createFileRoute } from '@tanstack/react-router';
import WorkersSection from '~pages/workers';

export const Route = createFileRoute('/workers')({
	component: WorkersSection,
});

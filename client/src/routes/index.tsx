import { createFileRoute } from '@tanstack/react-router';
import DashboardSection from '../pages/dashboard';

export const Route = createFileRoute('/')({
	component: DashboardSection,
});

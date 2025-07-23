import { createFileRoute } from '@tanstack/react-router';
import SettingsSection from '~pages/settings';

export const Route = createFileRoute('/settings')({
	component: SettingsSection,
});

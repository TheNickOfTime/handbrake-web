import { createFileRoute } from '@tanstack/react-router';
import PresetsPage from '~pages/presets';

export const Route = createFileRoute('/presets')({
	component: PresetsPage,
});

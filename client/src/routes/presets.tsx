import { createFileRoute } from '@tanstack/react-router';
import PresetsSection from '~pages/presets';

export const Route = createFileRoute('/presets')({
	component: PresetsSection,
});

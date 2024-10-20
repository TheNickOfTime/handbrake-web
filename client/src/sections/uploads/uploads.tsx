import Section from 'components/section/section';
import { PrimaryOutletContextType } from 'pages/primary/primary-context';
import { useOutletContext } from 'react-router-dom';
import Error from 'sections/error/error';

export default function UploadsSection() {
	const { config } = useOutletContext<PrimaryOutletContextType>();

	// Show error if uploads are disabled
	if (!config.upload['allow-uploads']) {
		return <Error />;
	}

	return <Section title='Uploads' id='uploads-section'></Section>;
}

import Section from '~components/root/section';

type Params = {
	url: string;
};

export default function NoConnection({ url }: Params) {
	return (
		<Section heading='Error'>
			<p>
				The client is unable to reach the server at {url}. Please check your server status
				or configuration.
			</p>
		</Section>
	);
}

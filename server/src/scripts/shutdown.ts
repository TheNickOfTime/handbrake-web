export default function Shutdown() {
	process.on('SIGINT', (signal) => {
		console.log(
			'[server] The process has been interrupted, HandBrake Web will now shutdown...'
		);
		process.exit(0);
	});

	process.on('SIGTERM', (signal) => {
		console.log('[server] The process has been terminated, HandBrake Web will now shutdown...');
		process.exit(0);
	});
}

import { DatabaseDisconnect } from './database/database';

export default function Shutdown() {
	process.on('SIGINT', (signal) => {
		console.log(
			'[server] [shutdown] The process has been interrupted, HandBrake Web will now begin to shutdown...'
		);
		OnShutdown();
	});

	process.on('SIGTERM', (signal) => {
		console.log(
			'[server] [shutdown] The process has been terminated, HandBrake Web will now begin to shutdown...'
		);
		OnShutdown();
	});
}

function OnShutdown() {
	DatabaseDisconnect();
	console.log(`[server] [shutdown] Shutdown steps have completed.`);
	process.exit();
}

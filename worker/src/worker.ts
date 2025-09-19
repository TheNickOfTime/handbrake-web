async function MyWorker() {
	const startup = await import('./worker-startup');
	startup.default();
}

MyWorker();

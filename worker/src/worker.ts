async function Worker() {
	const startup = await import('./worker-startup');
	startup.default();
}

Worker();

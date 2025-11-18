import esbuild from 'esbuild';
import { rm } from 'node:fs/promises';

console.info(`[worker] [build] Starting worker application build process...`);

// clear the existing contents of the output directory
await rm('build', { recursive: true, force: true });
console.info(`[server] [build] Cleared existing output from the 'build' directory.`);

// Build/bundle the server application
console.info(`[server] [build] Bundling the worker application...`);
try {
	await esbuild.build({
		logLevel: 'info',
		platform: 'node',
		bundle: true,
		allowOverwrite: true,
		entryPoints: ['src/worker.ts'],
		outdir: 'build',
	});
	console.info(`[server] [build] Successfully bundled the worker application.`);
} catch (err) {
	console.error(`[server] [build] [error] Could not bundle the worker application.`);
	throw err;
}

// Copy non-bundled dependencies
console.info(`[server] [build] Copying non-bundled dependencies to the build output location...`);
try {
	await copyFile('package.json', 'build/package.json');
} catch (err) {
	console.error(`[server] [build] [error] Could not copy all non-bundled dependencies.`);
	throw err;
}

console.info(`[worker] [build] Finished worker application build process.`);

import esbuild from 'esbuild';
import { copyFile, cp, rm } from 'node:fs/promises';

console.info(`[server] [build] Starting server application build process...`);

// clear the existing contents of the output directory
await rm('build', { recursive: true, force: true });
console.info(`[server] [build] Cleared existing output from the 'build' directory.`);

// Build/bundle the server application
console.info(`[server] [build] Bundling the server application...`);
try {
	await esbuild.build({
		logLevel: 'info',
		platform: 'node',
		bundle: true,
		allowOverwrite: true,
		entryPoints: ['src/server.ts'],
		outdir: 'build',
	});
	console.info(`[server] [build] Successfully bundled the server application.`);
} catch (err) {
	console.error(`[server] [build] [error] Could not bundle the server application.`);
	throw err;
}

// Copy non-bundled dependencies
console.info(`[server] [build] Copying non-bundled dependencies to the build output location...`);
try {
	await copyFile('package.json', 'build/package.json');

	await cp('node_modules/better-sqlite3/build', 'build/build', {
		recursive: true,
		dereference: true,
	});

	await cp('template', 'build/template', { recursive: true });
} catch (err) {
	console.error(`[server] [build] [error] Could not copy all non-bundled dependencies.`);
	throw err;
}

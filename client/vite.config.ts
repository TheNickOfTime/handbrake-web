import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { cwd, env } from 'process';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		outDir: './build',
		emptyOutDir: true,
	},
	plugins: [
		tanstackRouter({
			target: 'react',
			autoCodeSplitting: true,
		}),
		react(),
		svgr(),
	],
	resolve: {
		alias: {
			'@icons': resolve(cwd(), 'node_modules/bootstrap-icons/icons'),
			'~styles': resolve(cwd(), './src/styles'),
			'~components': resolve(cwd(), './src/components'),
			'~pages': resolve(cwd(), './src/pages'),
			'~layouts': resolve(cwd(), './src/layouts'),
			'~types': resolve(cwd(), '../shared/types'),
			'~dict': resolve(cwd(), '../shared/dict'),
			'~funcs': resolve(cwd(), '../shared/funcs'),
		},
	},
	define: {
		APP_VERSION: JSON.stringify(env.npm_package_version),
	},
});

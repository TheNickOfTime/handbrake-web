import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { env } from 'process';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

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
		tsconfigPaths(),
	],
	resolve: {
		alias: {
			'@style': path.resolve(__dirname, './src/style'),
			components: path.resolve(__dirname, './src/components'),
			pages: path.resolve(__dirname, './src/pages'),
			sections: path.resolve(__dirname, './src/sections'),
			types: path.resolve(__dirname, '../shared/types'),
			dict: path.resolve(__dirname, '../shared/dict'),
			funcs: path.resolve(__dirname, '../shared/funcs'),
		},
	},
	define: {
		APP_VERSION: JSON.stringify(env.npm_package_version),
	},
});

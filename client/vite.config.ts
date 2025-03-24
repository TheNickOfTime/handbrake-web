import { reactRouter } from '@react-router/dev/vite';
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
	plugins: [reactRouter(), tsconfigPaths()],
	resolve: {
		alias: {
			'@style': path.resolve(__dirname, './app/style'),
			components: path.resolve(__dirname, './app/components'),
			pages: path.resolve(__dirname, './app/pages'),
			sections: path.resolve(__dirname, './app/sections'),
			types: path.resolve(__dirname, '../shared/types'),
			dict: path.resolve(__dirname, '../shared/dict'),
			funcs: path.resolve(__dirname, '../shared/funcs'),
		},
	},
	define: {
		APP_VERSION: JSON.stringify(env.npm_package_version),
	},
});

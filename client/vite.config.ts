import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		outDir: './build',
		emptyOutDir: true,
	},
	plugins: [react(), tsconfigPaths()],
	resolve: {
		alias: {
			components: path.resolve(__dirname, './src/components'),
			pages: path.resolve(__dirname, './src/pages'),
			sections: path.resolve(__dirname, './src/sections'),
			types: path.resolve(__dirname, '../shared/types'),
		},
	},
	server: {
		host: '127.0.0.1',
		port: 5173,
	},
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	server: {
		host: '127.0.0.1',
		port: process.env.CLIENT_PORT ? parseInt(process.env.CLIENT_PORT) : 5173,
	},
	build: {
		outDir: './build',
		emptyOutDir: true,
	},
});

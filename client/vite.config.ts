import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		outDir: './build',
		emptyOutDir: true,
	},
	plugins: [react(), tsconfigPaths()],
	server: {
		host: '127.0.0.1',
		port: 5173,
	},
});

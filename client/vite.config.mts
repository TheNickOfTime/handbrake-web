import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: '127.0.0.1',
		port: process.env.CLIENT_PORT ? parseInt(process.env.CLIENT_PORT) : 5173,
	},
	build: {
		outDir: '../build/client',
		emptyOutDir: true,
	},
});

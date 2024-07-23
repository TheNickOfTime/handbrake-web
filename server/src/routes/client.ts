import express, { Express } from 'express';
import path from 'path';

export default function ClientRoutes(app: Express) {
	const clientBuildPath = path.join('/handbrake-web/client');
	const isProduction = process.env.NODE_ENV == 'production';

	if (isProduction) {
		app.use(express.static(clientBuildPath));
	}

	app.get('*', (req, res) => {
		const htmlPath = isProduction
			? path.join(clientBuildPath, '/index.html')
			: path.join(__dirname, '../html/development/index.html');
		res.sendFile(htmlPath, (err) => {
			if (err) {
				console.error(err);
			}
		});
	});
}

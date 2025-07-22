import express, { Express, Request } from 'express';
import { GetJobLogByID } from 'logging';
import path from 'path';

export default function ClientRoutes(app: Express) {
	const clientBuildPath = path.join('/handbrake-web/client');
	const isProduction = process.env.NODE_ENV == 'production';

	if (isProduction) {
		app.use(express.static(clientBuildPath));
	}

	app.get('/logs/jobs', async (req: Request<{}, {}, {}, { id: number }>, res) => {
		const id = req.query.id;
		if (id) {
			const log = await GetJobLogByID(id);
			if (log) {
				res.download(log);
			} else {
				res.end();
			}
		}
	});

	app.get('/{*splat}', (req, res) => {
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

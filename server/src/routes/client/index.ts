import express from 'express';
import path from 'node:path';
import { cwd } from 'node:process';

const router = express.Router();

const clientBuildPath = path.join('/handbrake-web/client');
const isProduction = process.env.NODE_ENV == 'production';

if (isProduction) {
	router.use(express.static(clientBuildPath));
}

router.get('/{*splat}', (req, res) => {
	const htmlPath = isProduction
		? path.join(clientBuildPath, '/index.html')
		: path.join(cwd(), 'src/html/development/index.html');
	res.sendFile(htmlPath, (err) => {
		if (err) {
			console.error(err);
		}
	});
});

export { router as clientRoutes };

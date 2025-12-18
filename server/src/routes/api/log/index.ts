import { Router, type Request } from 'express';
import { GetJobLogByID } from 'logging';

const router = Router();

router.get('/log/job', async (req: Request<{}, {}, {}, { id: number }>, res) => {
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

export { router as logRoutes };

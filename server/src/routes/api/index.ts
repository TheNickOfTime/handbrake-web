import { Router } from 'express';
import { logRoutes } from './log';

const router = Router();

router.use('/log', logRoutes);

export { router as apiRoutes };

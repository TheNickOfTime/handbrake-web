import { Router } from 'express';
import { logRoutes } from './log';
import { mediaRoutes } from './media';

const router = Router();

router.use(logRoutes);
router.use(mediaRoutes);

export { router as apiRoutes };

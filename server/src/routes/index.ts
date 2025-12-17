import { Router } from 'express';
import { apiRoutes } from './api';
import { clientRoutes } from './client';

const router = Router();

router.use('/api', apiRoutes);
router.use('/', clientRoutes);

export { router as routes };

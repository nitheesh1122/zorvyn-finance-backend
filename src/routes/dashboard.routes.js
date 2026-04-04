import { Router } from 'express';

import { getSummary, getCategoryBreakdown } from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(protect);
router.use(restrictTo('viewer', 'analyst', 'admin'));

router.get('/summary', getSummary);
router.get('/categories', getCategoryBreakdown);

export default router;

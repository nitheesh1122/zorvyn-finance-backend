import { Router } from 'express';

import {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord
} from '../controllers/record.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(protect);

router.get('/', restrictTo('analyst', 'admin'), getRecords);
router.post('/', restrictTo('admin'), createRecord);
router.put('/:id', restrictTo('admin'), updateRecord);
router.delete('/:id', restrictTo('admin'), deleteRecord);

export default router;

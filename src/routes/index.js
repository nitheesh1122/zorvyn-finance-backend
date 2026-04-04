import { Router } from 'express';
import ApiResponse from '../utils/ApiResponse.js';
import authRoutes from './auth.routes.js';
import recordRoutes from './record.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/records', recordRoutes);

router.get('/health', (request, response) => {
  response.status(200).json(
    new ApiResponse(200, {
      timestamp: new Date().toISOString()
    }, 'OK')
  );
});

export default router;

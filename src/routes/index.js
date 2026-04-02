import { Router } from 'express';
import ApiResponse from '../utils/ApiResponse.js';

const router = Router();

router.get('/health', (request, response) => {
  response.status(200).json(
    new ApiResponse(200, {
      timestamp: new Date().toISOString()
    }, 'OK')
  );
});

export default router;

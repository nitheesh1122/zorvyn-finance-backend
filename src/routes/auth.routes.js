import { Router } from 'express';

import { loginUser, refreshToken, registerUser } from '../controllers/auth.controller.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/rbac.middleware.js';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);

router.get(
	'/me',
	protect,
	asyncHandler(async (request, response) => {
		response.status(200).json(
			new ApiResponse(200, { user: request.user }, 'Authenticated user fetched successfully')
		);
	})
);

router.get(
	'/admin',
	protect,
	restrictTo('admin'),
	asyncHandler(async (_request, response) => {
		response.status(200).json(new ApiResponse(200, { access: true }, 'Admin access granted'));
	})
);

export default router;
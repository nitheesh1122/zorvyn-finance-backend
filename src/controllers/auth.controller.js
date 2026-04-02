import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { login, refresh, register } from '../services/auth.service.js';

const registerUser = asyncHandler(async (request, response) => {
  const { name, email, password } = request.body || {};

  const result = await register({ name, email, password });

  response.status(201).json(new ApiResponse(201, result, 'User registered successfully'));
});

const loginUser = asyncHandler(async (request, response) => {
  const { email, password } = request.body || {};

  const result = await login({ email, password });

  response.status(200).json(new ApiResponse(200, result, 'Login successful'));
});

const refreshToken = asyncHandler(async (request, response) => {
  const { refreshToken: token } = request.body || {};

  const result = await refresh({ refreshToken: token });

  response.status(200).json(new ApiResponse(200, result, 'Token refreshed successfully'));
});

export { registerUser, loginUser, refreshToken };
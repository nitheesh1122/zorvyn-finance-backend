import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

const sanitizeUser = (userDocument) => {
  const userObject = userDocument.toObject();
  delete userObject.password;
  return userObject;
};

const generateAccessToken = (user) => {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
};

const register = async ({ name, email, password }) => {
  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  if (!name.trim() || !email.trim() || !password.trim()) {
    throw new ApiError(400, 'Name, email, and password are required');
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!emailRegex.test(normalizedEmail)) {
    throw new ApiError(400, 'A valid email address is required');
  }

  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters long');
  }

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new ApiError(409, 'User already exists');
  }

  let user;

  try {
    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, 'User already exists');
    }

    throw error;
  }

  const accessToken = generateAccessToken(user);

  return {
    user: sanitizeUser(user),
    accessToken
  };
};

const login = async ({ email, password }) => {
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new ApiError(400, 'Email and password are required');
  }

  if (!email.trim() || !password.trim()) {
    throw new ApiError(400, 'Email and password are required');
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!emailRegex.test(normalizedEmail)) {
    throw new ApiError(400, 'A valid email address is required');
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return {
    user: sanitizeUser(user),
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  };
};

const refresh = async ({ refreshToken }) => {
  if (typeof refreshToken !== 'string' || !refreshToken.trim()) {
    throw new ApiError(401, 'Refresh token is required');
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    throw new ApiError(500, 'Refresh token secret is not configured');
  }

  let payload;

  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (_error) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  if (!mongoose.isValidObjectId(payload.sub)) {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const user = await User.findById(payload.sub);

  if (!user || !user.isActive) {
    throw new ApiError(401, 'User not found or inactive');
  }

  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  };
};

export {
  register,
  login,
  refresh,
  generateAccessToken,
  generateRefreshToken
};
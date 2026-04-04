import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import ApiError from './utils/ApiError.js';
import apiRoutes from './routes/index.js';

const app = express();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later',
    errors: []
  }
});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use('/api/v1', apiLimiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1', apiRoutes);

app.use((request, response, next) => {
  next(new ApiError(404, `Route not found: ${request.originalUrl}`));
});

app.use((error, request, response, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return response.status(400).json({
      success: false,
      message: 'Invalid JSON payload',
      errors: []
    });
  }

  if (error?.name === 'ValidationError') {
    return response.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(error.errors).map((item) => item.message)
    });
  }

  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyValue || {})[0] || 'field';

    return response.status(409).json({
      success: false,
      message: `${duplicateField} already exists`,
      errors: []
    });
  }

  if (error?.name === 'JsonWebTokenError') {
    return response.status(401).json({
      success: false,
      message: 'Invalid token',
      errors: []
    });
  }

  if (error?.name === 'TokenExpiredError') {
    return response.status(401).json({
      success: false,
      message: 'Token expired',
      errors: []
    });
  }

  const statusCode = error?.statusCode || 500;
  const message = error?.message || 'Internal Server Error';

  response.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

export default app;

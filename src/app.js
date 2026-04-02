import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import ApiError from './utils/ApiError.js';
import apiRoutes from './routes/index.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1', apiRoutes);

app.use((request, response, next) => {
  next(new ApiError(404, `Route not found: ${request.originalUrl}`));
});

app.use((error, request, response) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  response.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

export default app;

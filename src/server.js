import dotenv from 'dotenv';

dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import validateEnv from './config/env.js';

validateEnv();

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

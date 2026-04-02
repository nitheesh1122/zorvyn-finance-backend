const requiredEnvVars = ['PORT', 'MONGO_URI', 'JWT_SECRET'];

const validateEnv = () => {
  const missingVars = requiredEnvVars.filter((name) => !process.env[name]);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

export default validateEnv;

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@test.com',
    password: '123456',
    role: 'admin'
  },
  {
    name: 'Analyst User',
    email: 'analyst@test.com',
    password: '123456',
    role: 'analyst'
  },
  {
    name: 'Viewer User',
    email: 'viewer@test.com',
    password: '123456',
    role: 'viewer'
  }
];

const runSeed = async () => {
  try {
    const { MONGO_URI } = process.env;

    if (!MONGO_URI) {
      throw new Error('MONGO_URI is not defined in .env');
    }

    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const emailsToReplace = seedUsers.map((user) => user.email);
    await User.deleteMany({ email: { $in: emailsToReplace } });

    const createdUsers = await User.create(seedUsers);

    console.log('Seeded users:');
    createdUsers.forEach((user) => {
      console.log(`- ${user.email} (${user.role})`);
    });

    console.log('Seeding completed successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);

    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    process.exit(1);
  }
};

runSeed();
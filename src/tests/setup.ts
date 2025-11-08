import mongoose from 'mongoose';
import { Config } from '../config';
import { authLimitStore, rateLimitStore } from '../middlewares/rateLimiter';

beforeAll(async () => {
  if (!Config.DB_TEST_URI) {
    throw new Error('DB_TEST_URI is not defined in the configuration.');
  }

  await mongoose.connect(Config.DB_TEST_URI);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db?.collections();

  if (collections) {
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }

  rateLimitStore.resetAll();
  authLimitStore.resetAll();
});

afterAll(async () => {
  await mongoose.connection.db?.dropDatabase();

  await mongoose.connection.close();
});

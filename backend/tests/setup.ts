// Runs BEFORE any test file imports the app, so the app reads these values.
import 'dotenv/config';

const testDb = process.env.TEST_DATABASE_URL;
if (!testDb) throw new Error('TEST_DATABASE_URL is not set (see .env.example)');
if (!/test/i.test(new URL(testDb).pathname)) {
  throw new Error('Refusing to run tests: TEST_DATABASE_URL database name must contain "test"');
}

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = testDb;
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-1234';
process.env.BCRYPT_ROUNDS = '4'; // fast hashing in tests only
process.env.AUTH_RATE_LIMIT_MAX = '1000';
process.env.API_RATE_LIMIT_MAX = '100000';
process.env.CLIENT_URL = 'http://localhost:5173,https://app.example.com';

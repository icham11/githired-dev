// Test environment setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/githired_test';

// Set timeout for tests
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
  generateTestUser: () => ({
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'Password123!',
    fullName: 'Test User'
  }),
  
  generateTestInterview: () => ({
    role: 'Software Engineer',
    difficulty: 'Mid',
    language: 'English'
  })
};

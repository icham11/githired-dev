// Test environment setup
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing";
process.env.DATABASE_URL =
  "postgresql://test:test@localhost:5432/githired_test";

// Set timeout for tests
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
  generateTestUser: () => ({
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: "Password123!",
    fullName: "Test User",
  }),

  generateTestInterview: () => ({
    role: "Software Engineer",
    difficulty: "Mid",
    language: "English",
  }),
};

// Initialize database for tests
const sequelize = require("../config/database");
const models = require("../models");

// Sync database before any tests run
beforeAll(async () => {
  try {
    await sequelize.sync({ force: true }); // Reset DB before tests
  } catch (error) {
    console.error("Failed to sync database:", error);
    throw error;
  }
});

// Close database connection after all tests
afterAll(async () => {
  try {
    await sequelize.close();
  } catch (error) {
    console.error("Failed to close database:", error);
  }
});

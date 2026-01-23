const request = require("supertest");
const app = require("../app");
const { User } = require("../models");

describe("Auth API Tests", () => {
  let authToken;

  beforeEach(async () => {
    // Clear test data before each test
    await User.destroy({ where: {}, truncate: true });
  });

  describe("POST /auth/register", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app).post("/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
        fullName: "Test User",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe("test@example.com");
    });

    it("should fail with duplicate email", async () => {
      // First register
      await request(app).post("/auth/register").send({
        username: "testuser2",
        email: "duplicate@example.com",
        password: "Password123!",
      });

      // Try to register again with same email
      const response = await request(app).post("/auth/register").send({
        username: "testuser3",
        email: "duplicate@example.com",
        password: "Password123!",
        fullName: "Test User 3",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should fail with invalid email format", async () => {
      const response = await request(app).post("/auth/register").send({
        username: "testuser3",
        email: "invalid-email",
        password: "Password123!",
        fullName: "Test User 3",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      // Create a user before login tests
      await request(app).post("/auth/register").send({
        username: "loginuser",
        email: "login@example.com",
        password: "Password123!",
      });
    });

    it("should login successfully with valid credentials", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "login@example.com",
        password: "Password123!",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      authToken = response.body.token;
    });

    it("should fail with invalid password", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "login@example.com",
        password: "WrongPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain("Invalid");
    });

    it("should fail with non-existent email", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "nonexistent@example.com",
        password: "Password123!",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /user/profile", () => {
    beforeEach(async () => {
      // Create and login a user
      await request(app).post("/auth/register").send({
        username: "profileuser",
        email: "profile@example.com",
        password: "Password123!",
      });

      const loginRes = await request(app).post("/auth/login").send({
        email: "profile@example.com",
        password: "Password123!",
      });

      authToken = loginRes.body.token;
    });

    it("should get current user profile with valid token", async () => {
      const response = await request(app)
        .get("/user/profile")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty("email", "profile@example.com");
    });

    it("should fail without authorization token", async () => {
      const response = await request(app).get("/user/profile");

      expect(response.status).toBe(401);
    });
  });
});

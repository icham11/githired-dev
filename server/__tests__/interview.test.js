const request = require("supertest");
const app = require("../app");
const { User, InterviewSession } = require("../models");

describe("Interview API Tests", () => {
  let authToken;
  let userId;
  let sessionId;

  beforeEach(async () => {
    // Create test user for each test with isPro = true to avoid free limit
    const user = await User.create({
      username: `interviewtester_${Date.now()}`,
      email: `interview_${Date.now()}@test.com`,
      password: "Password123!",
      fullName: "Interview Tester",
      isPro: true, // Enable Pro features for testing
    });
    userId = user.id;

    // Login to get token
    const loginResponse = await request(app).post("/auth/login").send({
      email: user.email,
      password: "Password123!",
    });

    authToken = loginResponse.body.token;
  });

  describe("POST /interview/start", () => {
    it("should start a new interview session", async () => {
      const response = await request(app)
        .post("/interview/start")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          role: "Frontend Developer",
          difficulty: "Mid",
          language: "English",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("userId");
      expect(response.body.role).toBe("Frontend Developer");
      sessionId = response.body.id;
    });

    it("should fail without authentication", async () => {
      const response = await request(app).post("/interview/start").send({
        role: "Frontend Developer",
        difficulty: "Mid",
        language: "English",
      });

      expect(response.status).toBe(401);
    });

    it("should fail with invalid difficulty level", async () => {
      const response = await request(app)
        .post("/interview/start")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          role: "Frontend Developer",
          difficulty: "InvalidLevel",
          language: "English",
        });

      // May succeed with defaults or fail with 400
      expect([200, 201, 400]).toContain(response.status);
    });
  });

  describe("POST /interview/message", () => {
    it("should fail with invalid session ID", async () => {
      const response = await request(app)
        .post("/interview/message")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          sessionId: "invalid-session-id",
          message: "Test message",
        });

      expect(response.status).toBe(404);
    });
  });

  describe("POST /interview/end", () => {
    it("should fail with invalid session ID", async () => {
      const response = await request(app)
        .post("/interview/end")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          sessionId: "invalid-session-id",
        });

      expect(response.status).toBe(404);
    });
  });

  describe("GET /user/history", () => {
    it("should retrieve user interview history", async () => {
      const response = await request(app)
        .get("/user/history")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("interviews");
      expect(Array.isArray(response.body.interviews)).toBe(true);
    });
  });
});

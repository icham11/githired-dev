const request = require("supertest");
const app = require("../app");
const { User } = require("../models");
const path = require("path");

describe("Resume API Tests", () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Create test user for each test with isPro = true to avoid limits
    const user = await User.create({
      username: `resumetester_${Date.now()}`,
      email: `resume_${Date.now()}@test.com`,
      password: "Password123!",
      fullName: "Resume Tester",
      isPro: true, // Enable Pro features for testing
    });
    userId = user.id;

    // Login
    const loginResponse = await request(app).post("/auth/login").send({
      email: user.email,
      password: "Password123!",
    });

    authToken = loginResponse.body.token;
  });

  describe("POST /resume/analyze", () => {
    it("should require authentication", async () => {
      const response = await request(app).post("/resume/analyze");

      expect(response.status).toBe(401);
    });

    it("should fail without file upload", async () => {
      const response = await request(app)
        .post("/resume/analyze")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it("should validate file type (PDF only)", async () => {
      const response = await request(app)
        .post("/resume/analyze")
        .set("Authorization", `Bearer ${authToken}`)
        .attach("resume", Buffer.from("fake file"), "test.txt");

      expect(response.status).toBe(400);
    });
  });
});

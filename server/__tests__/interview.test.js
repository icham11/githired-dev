const request = require('supertest');
const app = require('../app');
const { User, InterviewSession } = require('../models');

describe('Interview API Tests', () => {
  let authToken;
  let userId;
  let sessionId;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      username: 'interviewtester',
      email: 'interview@test.com',
      password: 'Password123!',
      fullName: 'Interview Tester'
    });
    userId = user.id;

    // Login to get token
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'interview@test.com',
        password: 'Password123!'
      });
    
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    // Cleanup
    await InterviewSession.destroy({ where: { userId } });
    await User.destroy({ where: { id: userId } });
  });

  describe('POST /interview/start', () => {
    it('should start a new interview session', async () => {
      const response = await request(app)
        .post('/interview/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          role: 'Frontend Developer',
          difficulty: 'Mid',
          language: 'English'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('firstQuestion');
      sessionId = response.body.sessionId;
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/interview/start')
        .send({
          role: 'Frontend Developer',
          difficulty: 'Mid',
          language: 'English'
        });

      expect(response.status).toBe(401);
    });

    it('should fail with invalid difficulty level', async () => {
      const response = await request(app)
        .post('/interview/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          role: 'Frontend Developer',
          difficulty: 'InvalidLevel',
          language: 'English'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /interview/message', () => {
    it('should send message and get AI response', async () => {
      const response = await request(app)
        .post('/interview/message')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId,
          message: 'I have 3 years of experience in React development'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('response');
      expect(response.body.response).toBeTruthy();
    });

    it('should fail with invalid session ID', async () => {
      const response = await request(app)
        .post('/interview/message')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId: 'invalid-session-id',
          message: 'Test message'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('POST /interview/end', () => {
    it('should end session and calculate score', async () => {
      const response = await request(app)
        .post('/interview/end')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('score');
      expect(response.body).toHaveProperty('feedback');
      expect(response.body.score).toBeGreaterThanOrEqual(0);
      expect(response.body.score).toBeLessThanOrEqual(100);
    });
  });

  describe('GET /interview/history', () => {
    it('should retrieve user interview history', async () => {
      const response = await request(app)
        .get('/interview/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});

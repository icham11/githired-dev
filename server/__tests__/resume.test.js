const request = require('supertest');
const app = require('../app');
const { User } = require('../models');
const path = require('path');

describe('Resume API Tests', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Create test user
    const user = await User.create({
      username: 'resumetester',
      email: 'resume@test.com',
      password: 'Password123!',
      fullName: 'Resume Tester'
    });
    userId = user.id;

    // Login
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'resume@test.com',
        password: 'Password123!'
      });
    
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await User.destroy({ where: { id: userId } });
  });

  describe('POST /resume/analyze', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/resume/analyze');

      expect(response.status).toBe(401);
    });

    it('should fail without file upload', async () => {
      const response = await request(app)
        .post('/resume/analyze')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    // Note: Actual file upload testing requires mock file or test PDF
    it('should validate file type (PDF only)', async () => {
      const response = await request(app)
        .post('/resume/analyze')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('resume', Buffer.from('fake file'), 'test.txt');

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('PDF');
    });
  });

  describe('GET /resume/history', () => {
    it('should get user resume analysis history', async () => {
      const response = await request(app)
        .get('/resume/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/resume/history');

      expect(response.status).toBe(401);
    });
  });
});

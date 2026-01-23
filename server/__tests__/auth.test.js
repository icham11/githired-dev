const request = require('supertest');
const app = require('../app');
const { User } = require('../models');

describe('Auth API Tests', () => {
  let authToken;
  
  beforeAll(async () => {
    // Setup: Clear test data
    await User.destroy({ where: { email: 'test@example.com' } });
  });

  afterAll(async () => {
    // Cleanup
    await User.destroy({ where: { email: 'test@example.com' } });
  });

  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!',
          fullName: 'Test User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should fail with duplicate email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser2',
          email: 'test@example.com',
          password: 'Password123!',
          fullName: 'Test User 2'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          username: 'testuser3',
          email: 'invalid-email',
          password: 'Password123!',
          fullName: 'Test User 3'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      authToken = response.body.access_token;
    });

    it('should fail with invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /auth/me', () => {
    it('should get current user profile with valid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'test@example.com');
    });

    it('should fail without authorization token', async () => {
      const response = await request(app)
        .get('/auth/me');

      expect(response.status).toBe(401);
    });
  });
});

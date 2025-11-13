// Backend Auth Route Tests
const request = require('supertest');
const express = require('express');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./setup');
const { mockUsers, hashPassword } = require('./mocks/testData');
const User = require('../models/User');
const authRoutes = require('../routes/auth');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('POST /auth/signup', () => {
    test('should create new user with valid data', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send(mockUsers.validUser)
        .expect(201);

      expect(res.body).toHaveProperty('message', 'User created successfully');
      expect(res.body).toHaveProperty('userId');

      const user = await User.findById(res.body.userId);
      expect(user).toBeTruthy();
      expect(user.email).toBe(mockUsers.validUser.email);
    });

    test('should reject duplicate email', async () => {
      await User.create({
        ...mockUsers.validUser,
        password: await hashPassword(mockUsers.validUser.password),
      });

      const res = await request(app)
        .post('/auth/signup')
        .send(mockUsers.validUser)
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    test('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send(mockUsers.invalidEmail)
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });

    test('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({ username: 'test' })
        .expect(400);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await User.create({
        ...mockUsers.validUser,
        password: await hashPassword(mockUsers.validUser.password),
      });
    });

    test('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: mockUsers.validUser.email,
          password: mockUsers.validUser.password,
        })
        .expect(200);

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(mockUsers.validUser.email);
    });

    test('should reject incorrect password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: mockUsers.validUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    test('should reject non-existent user', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /auth/profile', () => {
    let token;
    let userId;

    beforeEach(async () => {
      const user = await User.create({
        ...mockUsers.validUser,
        password: await hashPassword(mockUsers.validUser.password),
      });
      userId = user._id;

      const loginRes = await request(app)
        .post('/auth/login')
        .send({
          email: mockUsers.validUser.email,
          password: mockUsers.validUser.password,
        });
      token = loginRes.body.token;
    });

    test('should return user profile with valid token', async () => {
      const res = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(mockUsers.validUser.email);
      expect(res.body).toHaveProperty('stats');
    });

    test('should reject request without token', async () => {
      const res = await request(app)
        .get('/auth/profile')
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    test('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });
  });
});

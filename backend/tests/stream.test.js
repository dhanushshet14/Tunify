// Backend Stream Route Tests
const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./setup');
const { mockUsers, hashPassword } = require('./mocks/testData');
const User = require('../models/User');
const authRoutes = require('../routes/auth');
const streamRoutes = require('../routes/stream');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/stream', streamRoutes);

describe('Stream Routes', () => {
  let token;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearDatabase();

    const user = await User.create({
      ...mockUsers.validUser,
      password: await hashPassword(mockUsers.validUser.password),
    });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: mockUsers.validUser.email,
        password: mockUsers.validUser.password,
      });
    token = loginRes.body.token;
  });

  describe('GET /stream/:filename', () => {
    test('should reject unauthenticated request', async () => {
      const res = await request(app)
        .get('/stream/test.mp3')
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });

    test('should return 404 for non-existent file', async () => {
      const res = await request(app)
        .get('/stream/nonexistent.mp3')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });

    test('should support range requests', async () => {
      // This test assumes a test file exists
      // In real scenario, you'd create a test file
      const res = await request(app)
        .get('/stream/test.mp3')
        .set('Authorization', `Bearer ${token}`)
        .set('Range', 'bytes=0-1023')
        .expect(206);

      expect(res.headers).toHaveProperty('content-range');
      expect(res.headers).toHaveProperty('accept-ranges', 'bytes');
    });

    test('should have proper CORS headers', async () => {
      const res = await request(app)
        .get('/stream/test.mp3')
        .set('Authorization', `Bearer ${token}`);

      expect(res.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});

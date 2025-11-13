// Backend Songs Route Tests
const request = require('supertest');
const express = require('express');
const { setupTestDB, teardownTestDB, clearDatabase } = require('./setup');
const { mockUsers, mockSongs, hashPassword } = require('./mocks/testData');
const User = require('../models/User');
const Song = require('../models/Song');
const authRoutes = require('../routes/auth');
const songsRoutes = require('../routes/songs');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/songs', songsRoutes);

describe('Songs Routes', () => {
  let token;
  let userId;

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
    userId = user._id;

    const loginRes = await request(app)
      .post('/auth/login')
      .send({
        email: mockUsers.validUser.email,
        password: mockUsers.validUser.password,
      });
    token = loginRes.body.token;
  });

  describe('GET /songs', () => {
    beforeEach(async () => {
      await Song.create([
        { ...mockSongs.song1, uploadedBy: userId },
        { ...mockSongs.song2, uploadedBy: userId },
      ]);
    });

    test('should return all songs for authenticated user', async () => {
      const res = await request(app)
        .get('/songs')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('artist');
    });

    test('should reject unauthenticated request', async () => {
      const res = await request(app)
        .get('/songs')
        .expect(401);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('GET /songs/search', () => {
    beforeEach(async () => {
      await Song.create([
        { ...mockSongs.song1, uploadedBy: userId },
        { ...mockSongs.song2, uploadedBy: userId },
      ]);
    });

    test('should search songs by title', async () => {
      const res = await request(app)
        .get('/songs/search?q=Test Song 1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0].title).toContain('Test Song 1');
    });

    test('should search songs by artist', async () => {
      const res = await request(app)
        .get('/songs/search?q=Test Artist 2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].artist).toContain('Test Artist 2');
    });

    test('should return empty array for no matches', async () => {
      const res = await request(app)
        .get('/songs/search?q=NonExistentSong')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    test('should respond quickly (< 500ms)', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/songs/search?q=Test')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(500);
    });
  });

  describe('GET /songs/:id', () => {
    let songId;

    beforeEach(async () => {
      const song = await Song.create({
        ...mockSongs.song1,
        uploadedBy: userId,
      });
      songId = song._id;
    });

    test('should return song by ID', async () => {
      const res = await request(app)
        .get(`/songs/${songId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('title', mockSongs.song1.title);
      expect(res.body).toHaveProperty('artist', mockSongs.song1.artist);
    });

    test('should return 404 for non-existent song', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .get(`/songs/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body).toHaveProperty('error');
    });
  });

  describe('DELETE /songs/:id', () => {
    let songId;

    beforeEach(async () => {
      const song = await Song.create({
        ...mockSongs.song1,
        uploadedBy: userId,
      });
      songId = song._id;
    });

    test('should delete own song', async () => {
      const res = await request(app)
        .delete(`/songs/${songId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body).toHaveProperty('message');

      const deletedSong = await Song.findById(songId);
      expect(deletedSong).toBeNull();
    });

    test('should not delete other user\'s song', async () => {
      const otherUser = await User.create({
        ...mockUsers.validUser2,
        password: await hashPassword(mockUsers.validUser2.password),
      });

      const otherSong = await Song.create({
        ...mockSongs.song2,
        uploadedBy: otherUser._id,
      });

      const res = await request(app)
        .delete(`/songs/${otherSong._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(res.body).toHaveProperty('error');
    });
  });
});

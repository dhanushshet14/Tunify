// Test Data Mocks
const bcrypt = require('bcryptjs');

const mockUsers = {
  validUser: {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Test123!@#',
  },
  validUser2: {
    username: 'testuser2',
    email: 'test2@example.com',
    password: 'Test456!@#',
  },
  invalidEmail: {
    username: 'baduser',
    email: 'invalid-email',
    password: 'Test123!@#',
  },
  shortPassword: {
    username: 'shortpass',
    email: 'short@example.com',
    password: '123',
  },
};

const mockSongs = {
  song1: {
    title: 'Test Song 1',
    artist: 'Test Artist 1',
    album: 'Test Album',
    duration: 180,
    filename: 'test-song-1.mp3',
    fileSize: 5242880,
    mimeType: 'audio/mpeg',
  },
  song2: {
    title: 'Test Song 2',
    artist: 'Test Artist 2',
    album: 'Test Album 2',
    duration: 240,
    filename: 'test-song-2.mp3',
    fileSize: 6291456,
    mimeType: 'audio/mpeg',
  },
};

const mockPlaylists = {
  playlist1: {
    name: 'My Test Playlist',
    description: 'A playlist for testing',
    isPublic: true,
  },
  playlist2: {
    name: 'Private Playlist',
    description: 'Private test playlist',
    isPublic: false,
  },
};

// Helper to create hashed password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

module.exports = {
  mockUsers,
  mockSongs,
  mockPlaylists,
  hashPassword,
};

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Signup
router.post('/signup', async (req, res) => {
  console.log('\n📝 ========== SIGNUP ATTEMPT ==========');
  console.log('Username:', req.body.username);
  console.log('Email:', req.body.email);
  console.log('Time:', new Date().toISOString());
  
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      console.error('❌ Missing required fields');
      console.error('======================================\n');
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      console.error('❌ Password too short');
      console.error('======================================\n');
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    console.log('🔍 Checking for existing user...');
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.error('❌ User already exists');
      console.error('======================================\n');
      return res.status(400).json({ error: 'User already exists with this email or username' });
    }
    
    console.log('✅ Email/username available');

    console.log('💾 Creating user document...');
    const user = new User({
      username,
      email,
      passwordHash: password
    });

    await user.save();
    console.log('✅ User created successfully:', user._id);

    console.log('🎫 Generating JWT token...');
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ Token generated (first 20 chars):', token.substring(0, 20) + '...');
    console.log('======================================\n');

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    console.error('Stack:', error.stack);
    console.error('======================================\n');
    res.status(500).json({ error: error.message || 'Server error during signup' });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log('\n🔐 ========== LOGIN ATTEMPT ==========');
  console.log('Email:', req.body.email);
  console.log('Time:', new Date().toISOString());
  
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.error('❌ Missing credentials');
      console.error('=====================================\n');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    console.log('🔍 Looking up user:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.error('❌ User not found:', email);
      console.error('=====================================\n');
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    console.log('✅ User found:', user._id);

    console.log('🔑 Verifying password...');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.error('❌ Password mismatch');
      console.error('=====================================\n');
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    console.log('✅ Password verified');

    console.log('🎫 Generating JWT token...');
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('✅ Login successful for user:', user._id);
    console.log('Token (first 20 chars):', token.substring(0, 20) + '...');
    console.log('=====================================\n');

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('Stack:', error.stack);
    console.error('=====================================\n');
    res.status(500).json({ error: error.message || 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select('-passwordHash')
      .populate('playlists');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile with stats (optimized with parallel queries)
router.get('/profile', auth, async (req, res) => {
  console.log('\n👤 ========== PROFILE REQUEST ==========');
  console.log('User ID:', req.userId);
  console.log('Time:', new Date().toISOString());
  
  try {
    const Song = require('../models/Song');
    const Playlist = require('../models/Playlist');
    
    console.log('🔍 Fetching user data and stats in parallel...');
    
    // Execute all queries in parallel for better performance
    const [user, songsCount, playlistsCount] = await Promise.all([
      User.findById(req.userId).select('-passwordHash').lean(),
      Song.countDocuments({ uploadedBy: req.userId }),
      Playlist.countDocuments({ owner: req.userId })
    ]);
    
    if (!user) {
      console.error('❌ User not found:', req.userId);
      console.error('=======================================\n');
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('✅ User found:', user.username);
    console.log('Stats - Songs:', songsCount, 'Playlists:', playlistsCount);
    console.log('✅ Profile data ready');
    console.log('=======================================\n');

    // Set cache headers
    res.set('Cache-Control', 'private, max-age=60'); // Cache for 1 minute

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      songsUploaded: songsCount,
      playlists: playlistsCount
    });
  } catch (error) {
    console.error('❌ Profile error:', error);
    console.error('Stack:', error.stack);
    console.error('=======================================\n');
    res.status(500).json({ error: error.message });
  }
});

// Logout (client-side token removal)
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseFile } = require('music-metadata');
const Song = require('../models/Song');
const auth = require('../middleware/auth');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedAudio = /mp3|wav|ogg|m4a/;
    const allowedImage = /jpg|jpeg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    
    if (file.fieldname === 'audio' && allowedAudio.test(ext)) {
      cb(null, true);
    } else if (file.fieldname === 'cover' && allowedImage.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Upload song
router.post('/upload', auth, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    if (!req.files || !req.files.audio) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const audioFile = req.files.audio[0];
    const coverFile = req.files.cover ? req.files.cover[0] : null;

    // Extract metadata
    const metadata = await parseFile(audioFile.path);
    const duration = Math.floor(metadata.format.duration || 0);

    const song = new Song({
      title: req.body.title || metadata.common.title || 'Untitled',
      artist: req.body.artist || metadata.common.artist || 'Unknown Artist',
      album: req.body.album || metadata.common.album || '',
      audioUrl: `/uploads/${audioFile.filename}`,
      coverUrl: coverFile ? `/uploads/${coverFile.filename}` : '/uploads/default-cover.jpg',
      duration,
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : [],
      uploadedBy: req.userId
    });

    await song.save();
    res.status(201).json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all songs with pagination and optimization
router.get('/all', auth, async (req, res) => {
  console.log('\n📚 ========== GET ALL SONGS ==========');
  console.log('User ID:', req.userId);
  console.log('Time:', new Date().toISOString());
  
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    console.log('🔍 Fetching songs with pagination...');
    console.log('Page:', page, 'Limit:', limit);
    
    // Use lean() for better performance (returns plain JS objects)
    const songs = await Song.find()
      .select('title artist album audioUrl coverUrl duration plays createdAt uploadedBy')
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    
    // Get total count for pagination
    const total = await Song.countDocuments();
    
    console.log(`✅ Found ${songs.length} songs (${total} total)`);
    console.log('======================================\n');
    
    res.json({
      songs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get all songs error:', error);
    console.error('Stack:', error.stack);
    console.error('======================================\n');
    res.status(500).json({ error: error.message });
  }
});

// Get song by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('uploadedBy', 'username');
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Optimized search with caching and indexes
router.get('/search', auth, async (req, res) => {
  const startTime = Date.now();
  console.log('\n🔍 ========== SEARCH REQUEST ==========');
  console.log('Query:', req.query.q);
  console.log('User ID:', req.userId);
  console.log('Time:', new Date().toISOString());
  
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      console.log('⚠️ Empty or too short search query');
      console.log('======================================\n');
      return res.json([]);
    }

    console.log('🔎 Searching database with optimized query...');
    
    // Use compound index for better performance
    // Prioritize exact matches, then partial matches
    const exactMatches = await Song.find({
      $or: [
        { title: { $regex: `^${q}`, $options: 'i' } },
        { artist: { $regex: `^${q}`, $options: 'i' } }
      ]
    })
    .select('title artist album audioUrl coverUrl duration plays uploadedBy')
    .populate('uploadedBy', 'username')
    .limit(10)
    .lean()
    .exec();

    // If we have enough exact matches, return them
    if (exactMatches.length >= 10) {
      const duration = Date.now() - startTime;
      console.log(`✅ Found ${exactMatches.length} exact matches in ${duration}ms`);
      console.log('======================================\n');
      return res.json(exactMatches);
    }

    // Otherwise, get partial matches too
    const partialMatches = await Song.find({
      $and: [
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { artist: { $regex: q, $options: 'i' } },
            { album: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
          ]
        },
        {
          _id: { $nin: exactMatches.map(s => s._id) }
        }
      ]
    })
    .select('title artist album audioUrl coverUrl duration plays uploadedBy')
    .populate('uploadedBy', 'username')
    .limit(20 - exactMatches.length)
    .lean()
    .exec();

    const results = [...exactMatches, ...partialMatches];
    const duration = Date.now() - startTime;
    console.log(`✅ Found ${results.length} results in ${duration}ms`);
    console.log('======================================\n');

    // Set cache headers for frequently searched terms
    res.set('Cache-Control', 'private, max-age=300'); // 5 minutes
    res.json(results);
  } catch (error) {
    console.error('❌ Search error:', error);
    console.error('Stack:', error.stack);
    console.error('======================================\n');
    res.status(500).json({ error: error.message });
  }
});

// Increment play count
router.post('/:id/play', auth, async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { $inc: { plays: 1 } },
      { new: true }
    );
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete song (only by uploader)
router.delete('/:id', auth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Check if user is the uploader
    if (song.uploadedBy.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this song' });
    }

    // Delete file from uploads directory
    const audioPath = path.join(__dirname, '../../uploads', path.basename(song.audioUrl));
    if (fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }

    // Delete cover image if exists
    if (song.coverUrl && !song.coverUrl.includes('default')) {
      const coverPath = path.join(__dirname, '../../uploads', path.basename(song.coverUrl));
      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    // Delete from database
    await Song.findByIdAndDelete(req.params.id);

    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Delete song error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

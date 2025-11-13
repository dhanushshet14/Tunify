const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create playlist
router.post('/create', auth, async (req, res) => {
  try {
    const { title, public: isPublic } = req.body;

    const playlist = new Playlist({
      title,
      owner: req.userId,
      public: isPublic || false
    });

    await playlist.save();

    await User.findByIdAndUpdate(req.userId, {
      $push: { playlists: playlist._id }
    });

    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user playlists
router.get('/my', auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({
      $or: [
        { owner: req.userId },
        { collaborators: req.userId }
      ]
    }).populate('songs').populate('owner', 'username');
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get playlist by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('songs')
      .populate('owner', 'username')
      .populate('collaborators', 'username');

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Check access
    if (!playlist.public && 
        playlist.owner._id.toString() !== req.userId.toString() &&
        !playlist.collaborators.some(c => c._id.toString() === req.userId.toString())) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update playlist
router.put('/:id', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { title, public: isPublic, coverUrl } = req.body;
    if (title) playlist.title = title;
    if (typeof isPublic !== 'undefined') playlist.public = isPublic;
    if (coverUrl) playlist.coverUrl = coverUrl;

    await playlist.save();
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete playlist
router.delete('/:id', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Playlist.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.userId, {
      $pull: { playlists: req.params.id }
    });

    res.json({ message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add song to playlist
router.post('/:id/addSong', auth, async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const isAuthorized = playlist.owner.toString() === req.userId.toString() ||
                        playlist.collaborators.some(c => c.toString() === req.userId.toString());

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      await playlist.save();

      // Emit socket event
      const io = req.app.get('io');
      io.to(`playlist-${playlist._id}`).emit('playlist-updated', playlist);
    }

    const updatedPlaylist = await Playlist.findById(req.params.id).populate('songs');
    res.json(updatedPlaylist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove song from playlist
router.post('/:id/removeSong', auth, async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const isAuthorized = playlist.owner.toString() === req.userId.toString() ||
                        playlist.collaborators.some(c => c.toString() === req.userId.toString());

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    playlist.songs = playlist.songs.filter(s => s.toString() !== songId);
    await playlist.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(`playlist-${playlist._id}`).emit('playlist-updated', playlist);

    const updatedPlaylist = await Playlist.findById(req.params.id).populate('songs');
    res.json(updatedPlaylist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add collaborator
router.post('/:id/addCollaborator', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (playlist.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (!playlist.collaborators.includes(userId)) {
      playlist.collaborators.push(userId);
      await playlist.save();
    }

    res.json(playlist);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

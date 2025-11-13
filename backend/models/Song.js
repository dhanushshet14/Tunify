const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
    type: String,
    required: true,
    trim: true
  },
  album: {
    type: String,
    trim: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  coverUrl: {
    type: String,
    default: '/uploads/default-cover.jpg'
  },
  duration: {
    type: Number,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plays: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound indexes for optimized queries
songSchema.index({ title: 'text', artist: 'text', album: 'text' }); // Text search
songSchema.index({ title: 1, artist: 1 }); // Exact match queries
songSchema.index({ artist: 1, createdAt: -1 }); // Artist sorting
songSchema.index({ uploadedBy: 1, createdAt: -1 }); // User's songs
songSchema.index({ plays: -1 }); // Popular songs
songSchema.index({ createdAt: -1 }); // Recent songs
songSchema.index({ tags: 1 }); // Tag filtering

// Virtual for formatted duration
songSchema.virtual('formattedDuration').get(function() {
  const mins = Math.floor(this.duration / 60);
  const secs = Math.floor(this.duration % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
});

// Optimize toJSON
songSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Song', songSchema);

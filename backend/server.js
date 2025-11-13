require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    methods: ['GET', 'POST']
  }
});

// Middleware - CORS must be first
app.use(cors({
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://192.168.1.7:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Add compression for API responses (before other middleware)
const compressionMiddleware = require('./middleware/compression');
app.use(compressionMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files with caching
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1y', // Cache for 1 year
  immutable: true,
  etag: true
}));

// Add comprehensive request logger
const logger = require('./middleware/logger');
app.use(logger);

// MongoDB Connection with detailed logging
console.log('\n🔌 ========== MONGODB CONNECTION ==========');
console.log('URI:', process.env.MONGODB_URI ? '✓ Set' : '✗ Missing');
console.log('Attempting connection...');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('Database:', mongoose.connection.name);
  console.log('Host:', mongoose.connection.host);
  console.log('==========================================\n');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.error('Stack:', err.stack);
  console.error('==========================================\n');
  process.exit(1);
});

// MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Socket.IO with detailed logging
io.on('connection', (socket) => {
  console.log('\n🔌 ========== SOCKET CONNECTION ==========');
  console.log('Socket ID:', socket.id);
  console.log('Client IP:', socket.handshake.address);
  console.log('Time:', new Date().toISOString());
  console.log('=========================================\n');

  socket.on('join-playlist', (playlistId) => {
    console.log(`📝 Socket ${socket.id} joined playlist: ${playlistId}`);
    socket.join(`playlist-${playlistId}`);
  });

  socket.on('leave-playlist', (playlistId) => {
    console.log(`📤 Socket ${socket.id} left playlist: ${playlistId}`);
    socket.leave(`playlist-${playlistId}`);
  });

  socket.on('disconnect', (reason) => {
    console.log('\n❌ ========== SOCKET DISCONNECT ==========');
    console.log('Socket ID:', socket.id);
    console.log('Reason:', reason);
    console.log('Time:', new Date().toISOString());
    console.log('==========================================\n');
  });
  
  socket.on('error', (error) => {
    console.error('\n❌ ========== SOCKET ERROR ==========');
    console.error('Socket ID:', socket.id);
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    console.error('=====================================\n');
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/songs', require('./routes/songs'));
app.use('/api/playlists', require('./routes/playlists'));
app.use('/api/stream', require('./routes/stream'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('\n✅ ========== SERVER READY ==========');
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: http://localhost:8080`);
  console.log(`Backend URL: http://localhost:${PORT}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('====================================\n');
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n❌ ========== UNHANDLED REJECTION ==========');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  console.error('Stack:', reason?.stack);
  console.error('===========================================\n');
});

process.on('uncaughtException', (error) => {
  console.error('\n❌ ========== UNCAUGHT EXCEPTION ==========');
  console.error('Error:', error);
  console.error('Stack:', error.stack);
  console.error('==========================================\n');
  process.exit(1);
});

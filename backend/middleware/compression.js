// Compression middleware for API responses
const compression = require('compression');

// Configure compression with optimal settings
const compressionMiddleware = compression({
  // Only compress responses larger than 1KB
  threshold: 1024,
  
  // Compression level (0-9, 6 is default, good balance)
  level: 6,
  
  // Filter function to determine what to compress
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Don't compress audio streams (already compressed)
    if (req.path.startsWith('/api/stream')) {
      return false;
    }
    
    // Use compression's default filter for everything else
    return compression.filter(req, res);
  }
});

module.exports = compressionMiddleware;
